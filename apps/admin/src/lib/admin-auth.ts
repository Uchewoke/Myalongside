import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

/**
 * Admin sessions — opaque-token model.
 *
 * The cookie holds ONLY a random opaque session token. The JWT never touches
 * the browser. Every read resolves the token against the backend
 * (GET /api/auth/admin/session), which checks the server-side AdminSession
 * table for expiry/revocation and re-verifies the user is still an unbanned
 * ADMIN — giving true server-side revocation: revoke the row and the console
 * session is dead on the next request.
 *
 * The resolve call returns a FRESH short-lived JWT (`token`) for server-side
 * proxying to admin backend APIs. It is never persisted and never sent to the
 * client.
 */

const ADMIN_SESSION_COOKIE = "myalongside-admin-session";
const isProduction = process.env.NODE_ENV === "production";
const backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:4000";

export type AdminSession = {
  /** Fresh short-lived backend JWT for server-side proxy calls only. */
  token: string;
  user: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
};

async function readSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  // Opaque tokens are 43-char base64url strings; reject anything odd early.
  if (!value || value.length > 128) return null;
  return value;
}

/**
 * Resolve the current admin session, or null.
 * Wrapped in React cache() so layout + page in the same request share one
 * backend round-trip.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const sessionToken = await readSessionCookie();
  if (!sessionToken) return null;

  const response = await fetch(`${backendUrl}/api/auth/admin/session`, {
    method: "GET",
    headers: { "x-admin-session": sessionToken },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) return null;

  const payload = (await response.json().catch(() => null)) as {
    user?: AdminSession["user"];
    accessToken?: string;
  } | null;

  if (!payload?.user || payload.user.role !== "ADMIN" || !payload.accessToken) {
    return null;
  }

  return { token: payload.accessToken, user: payload.user };
});

/** Store the opaque session token in the cookie. Nothing else goes in. */
export async function setAdminSession(sessionToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: isProduction,
    // strict: never sent on cross-site navigations; with assertSameOrigin()
    // on mutating routes this closes the CSRF surface.
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8, // matches the backend session TTL
  });
}

/** Revoke the session server-side, then drop the cookie. */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (sessionToken && sessionToken.length <= 128) {
    // Best effort — the cookie is cleared regardless, and the row still
    // expires on its own if the backend is briefly unreachable.
    await fetch(`${backendUrl}/api/auth/admin/session`, {
      method: "DELETE",
      headers: { "x-admin-session": sessionToken },
      cache: "no-store",
    }).catch(() => undefined);
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
