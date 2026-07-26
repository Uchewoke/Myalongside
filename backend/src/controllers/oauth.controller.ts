import { Request, Response } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { writeAuditLog, reqMeta } from "../lib/audit";
import { issueTokenPair } from "./auth.controller";
import {
  type OAuthProvider,
  PROVIDERS,
  isConfigured,
  redirectUriFor,
  createOAuthState,
  consumeOAuthState,
  createHandoffCode,
  consumeHandoffCode,
  exchangeCodeForProfile,
} from "../lib/oauth";

const FRONTEND_URL = process.env.WEB_URL ?? "http://localhost:3000";

function redirectToFrontendError(res: Response, message: string): void {
  res.redirect(`${FRONTEND_URL}/login?oauthError=${encodeURIComponent(message)}`);
}

/** GET /api/auth/:provider — redirects to the provider's consent screen. */
export function startOAuth(provider: OAuthProvider) {
  return (req: Request, res: Response): void => {
    if (!isConfigured(provider)) {
      redirectToFrontendError(res, `${provider} sign-in is not configured on this server.`);
      return;
    }

    const config = PROVIDERS[provider];
    const state = createOAuthState();
    const params = new URLSearchParams({
      client_id: config.clientId!,
      redirect_uri: redirectUriFor(provider),
      response_type: "code",
      scope: config.scope,
      state,
    });

    res.redirect(`${config.authorizeUrl}?${params.toString()}`);
  };
}

const callbackQuerySchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

/**
 * GET /api/auth/:provider/callback — exchanges the auth code for a profile,
 * finds-or-creates the user, mints our own JWT pair, and redirects back to
 * the frontend with a one-time handoff code (never the raw tokens — see
 * lib/oauth.ts for why).
 */
export function handleOAuthCallback(provider: OAuthProvider) {
  return async (req: Request, res: Response): Promise<void> => {
    const parsed = callbackQuerySchema.safeParse(req.query);
    const { code, state, error } = parsed.success ? parsed.data : {};

    if (error) {
      redirectToFrontendError(res, `${provider} sign-in was cancelled.`);
      return;
    }
    if (!code || !state || !consumeOAuthState(state)) {
      redirectToFrontendError(res, "That sign-in link is invalid or expired. Please try again.");
      return;
    }

    try {
      const profile = await exchangeCodeForProfile(provider, code);

      let user = await prisma.user.findUnique({ where: { email: profile.email } });
      let isNewUser = false;

      if (user && (user.deletedAt || user.isBanned)) {
        redirectToFrontendError(res, "This account is no longer active.");
        return;
      }

      if (!user) {
        // OAuth accounts get an unusable random password hash — the account
        // can only ever authenticate through this provider, never via
        // POST /api/auth/login.
        const passwordHash = await bcrypt.hash(randomUUID() + randomUUID(), 12);
        user = await prisma.user.create({
          data: {
            name: profile.name,
            email: profile.email,
            passwordHash,
            avatar: profile.avatar,
            role: "SEEKER",
            languages: [],
            emailConfirmed: true, // the provider already verified this address
          },
        });
        isNewUser = true;
      }

      const { accessToken, refreshToken } = await issueTokenPair(user.id, user.role);
      const handoffCode = createHandoffCode(accessToken, refreshToken);

      await writeAuditLog({
        userId: user.id,
        action: isNewUser ? "SIGNUP" : "LOGIN",
        resource: "User",
        resourceId: user.id,
        metadata: { provider },
        ...reqMeta(req),
      });

      res.redirect(`${FRONTEND_URL}/auth/callback?code=${handoffCode}`);
    } catch (err) {
      console.error(`[oauth:${provider}] callback failed:`, err);
      redirectToFrontendError(res, "Something went wrong signing you in. Please try again.");
    }
  };
}

const exchangeSchema = z.object({
  code: z.string().min(1),
});

/** POST /api/auth/oauth/exchange — trades a one-time handoff code for the real token pair. */
export async function exchangeOAuthCode(req: Request, res: Response): Promise<void> {
  const parsed = exchangeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Code required." });
    return;
  }

  const tokens = consumeHandoffCode(parsed.data.code);
  if (!tokens) {
    res.status(401).json({ error: "This sign-in link is invalid or has expired." });
    return;
  }

  res.json(tokens);
}
