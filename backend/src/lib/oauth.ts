/**
 * Google/Facebook OAuth2 (authorization code flow), plain fetch — no
 * provider SDK. Two short-lived, in-memory, one-time stores back it:
 *
 *  - oauthStates: the `state` param we hand the provider, checked on
 *    callback as CSRF protection (nothing else ties the callback back to
 *    the request that started it, since we don't use cookies here).
 *  - handoffCodes: after a successful callback we mint our own JWT pair but
 *    can't hand it to the browser directly (query params would put it in
 *    browser history/referrer). Instead we redirect with a one-time opaque
 *    code; the frontend immediately exchanges it server-side for the real
 *    tokens via POST /api/auth/oauth/exchange.
 *
 * Both stores are single-process and fine for this app's current scale; if
 * the backend ever runs multi-instance behind a load balancer, move them to
 * Redis (same TTL/one-time-use semantics).
 */

import { randomUUID } from "crypto";

export type OAuthProvider = "google" | "facebook";

interface ProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scope: string;
  clientId?: string;
  clientSecret?: string;
}

export const PROVIDERS: Record<OAuthProvider, ProviderConfig> = {
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
    scope: "openid email profile",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  facebook: {
    authorizeUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    userInfoUrl: "https://graph.facebook.com/me?fields=id,name,email,picture.type(large)",
    scope: "email public_profile",
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  },
};

export interface OAuthProfile {
  providerUserId: string;
  email: string;
  name: string;
  avatar?: string;
}

const API_BASE_URL = process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;

export function redirectUriFor(provider: OAuthProvider): string {
  return `${API_BASE_URL}/api/auth/${provider}/callback`;
}

export function isConfigured(provider: OAuthProvider): boolean {
  const config = PROVIDERS[provider];
  return Boolean(config.clientId && config.clientSecret);
}

// ── One-time stores ─────────────────────────────────────────────────────────

const STATE_TTL_MS = 10 * 60 * 1000;
const HANDOFF_TTL_MS = 60 * 1000;

const oauthStates = new Map<string, number>(); // state -> expiresAt
const handoffCodes = new Map<string, { accessToken: string; refreshToken: string; expiresAt: number }>();

function sweepOAuthStates(): void {
  const now = Date.now();
  for (const [state, expiresAt] of oauthStates) {
    if (now > expiresAt) oauthStates.delete(state);
  }
}

function sweepHandoffCodes(): void {
  const now = Date.now();
  for (const [code, entry] of handoffCodes) {
    if (now > entry.expiresAt) handoffCodes.delete(code);
  }
}

export function createOAuthState(): string {
  sweepOAuthStates();
  const state = randomUUID();
  oauthStates.set(state, Date.now() + STATE_TTL_MS);
  return state;
}

/** One-time check: valid iff it was issued by us and hasn't been consumed or expired. */
export function consumeOAuthState(state: string): boolean {
  const expiresAt = oauthStates.get(state);
  oauthStates.delete(state);
  return expiresAt !== undefined && Date.now() <= expiresAt;
}

export function createHandoffCode(accessToken: string, refreshToken: string): string {
  sweepHandoffCodes();
  const code = randomUUID();
  handoffCodes.set(code, { accessToken, refreshToken, expiresAt: Date.now() + HANDOFF_TTL_MS });
  return code;
}

export function consumeHandoffCode(
  code: string
): { accessToken: string; refreshToken: string } | null {
  const entry = handoffCodes.get(code);
  handoffCodes.delete(code);
  if (!entry || Date.now() > entry.expiresAt) return null;
  return { accessToken: entry.accessToken, refreshToken: entry.refreshToken };
}

// ── Provider token/profile exchange ─────────────────────────────────────────

export async function exchangeCodeForProfile(
  provider: OAuthProvider,
  code: string
): Promise<OAuthProfile> {
  const config = PROVIDERS[provider];
  if (!config.clientId || !config.clientSecret) {
    throw new Error(`${provider} OAuth is not configured.`);
  }

  const tokenRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      redirect_uri: redirectUriFor(provider),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`${provider} token exchange failed (${tokenRes.status}).`);
  }

  const tokenBody = (await tokenRes.json()) as { access_token?: string };
  if (!tokenBody.access_token) {
    throw new Error(`${provider} token exchange returned no access token.`);
  }

  const userRes = await fetch(config.userInfoUrl, {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  });

  if (!userRes.ok) {
    throw new Error(`${provider} profile lookup failed (${userRes.status}).`);
  }

  const profile = (await userRes.json()) as Record<string, any>;

  if (provider === "google") {
    if (!profile.email) throw new Error("Google account has no email.");
    return {
      providerUserId: profile.sub,
      email: profile.email,
      name: profile.name ?? profile.email,
      avatar: profile.picture,
    };
  }

  // facebook
  if (!profile.email) {
    throw new Error("Facebook account has no email — grant email permission and try again.");
  }
  return {
    providerUserId: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email,
    avatar: profile.picture?.data?.url,
  };
}
