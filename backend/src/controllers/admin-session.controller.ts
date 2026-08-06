/**
 * Server-side admin console sessions.
 *
 * The admin Next.js app holds ONLY an opaque random token in its cookie.
 * The backend stores a SHA-256 hash of that token in the AdminSession table,
 * giving real server-side revocation: delete/revoke the row and the session is
 * dead on the next request, no matter what the browser still holds.
 *
 * Endpoints (mounted under /api/auth/admin/session):
 *   POST   — email/password login, ADMIN role required → { sessionToken, user }
 *   GET    — resolve: x-admin-session header → { user, accessToken }
 *            accessToken is a FRESH short-lived JWT minted per resolve, used by
 *            the admin app server-side to call admin backend APIs. It never
 *            reaches the browser.
 *   DELETE — revoke the presented session.
 *
 * Why SHA-256 and not bcrypt: the session token is 256 bits of CSPRNG output,
 * so brute-forcing the hash is infeasible without slow hashing — and SHA-256
 * allows a unique-indexed O(1) lookup instead of a bcrypt scan.
 */

import { Request, Response } from "express";
import { createHash, randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { writeAuditLog, reqMeta } from "../lib/audit";
import { issueAccessToken, issueMfaSetupToken } from "./auth.controller";
import { verifyTotp, consumeBackupCode } from "../lib/mfa";

const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h, matches the admin cookie
const SESSION_HEADER = "x-admin-session";

// Constant bcrypt hash of a random string; compared against on the
// unknown-email path so login timing doesn't reveal account existence.
const DUMMY_HASH = bcrypt.hashSync(randomUUID(), 12);

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
  // Second factor — required whenever the account already has MFA enabled.
  totp: z.string().regex(/^\d{6}$/).optional(),
  backupCode: z.string().min(6).max(20).optional(),
});

const ADMIN_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** POST /api/auth/admin/session — admin login, creates a server-side session. */
export async function createAdminSession(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid credentials." });
    return;
  }

  const { email, password, totp, backupCode } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...ADMIN_USER_SELECT,
      passwordHash: true,
      isBanned: true,
      deletedAt: true,
      mfaEnabled: true,
      mfaSecret: true,
      mfaBackupCodes: true,
    },
  });

  // Always run one bcrypt compare so unknown-email and wrong-password paths
  // take the same time (finding #4 from the audit, applied here from day one).
  const passwordOk = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_HASH
  );

  if (!user || !passwordOk || user.deletedAt || user.isBanned) {
    await writeAuditLog({
      action: "ADMIN_LOGIN_FAILED",
      metadata: { email },
      ...reqMeta(req),
    });
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  if (user.role !== "ADMIN") {
    await writeAuditLog({
      userId: user.id,
      action: "ADMIN_LOGIN_DENIED_NOT_ADMIN",
      ...reqMeta(req),
    });
    // Same message as bad credentials: don't confirm the account exists but
    // lacks the role.
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  // Mandatory MFA: an admin account without it enrolled gets a short-lived
  // setup ticket instead of a real session — it can ONLY call /api/auth/mfa/*.
  if (!user.mfaEnabled || !user.mfaSecret) {
    await writeAuditLog({
      userId: user.id,
      action: "ADMIN_LOGIN_DENIED_MFA_REQUIRED",
      ...reqMeta(req),
    });
    res.status(403).json({
      error: "MFA enrollment is required for admin accounts.",
      mfaSetupRequired: true,
      setupToken: issueMfaSetupToken(user.id),
    });
    return;
  }

  const totpOk = totp ? verifyTotp(user.mfaSecret, totp) : false;
  const remainingBackupCodes = !totpOk && backupCode
    ? await consumeBackupCode(user.mfaBackupCodes, backupCode)
    : null;

  if (!totpOk && !remainingBackupCodes) {
    await writeAuditLog({
      userId: user.id,
      action: "ADMIN_LOGIN_MFA_FAILED",
      ...reqMeta(req),
    });
    res.status(401).json({ error: "Invalid or missing MFA code." });
    return;
  }

  if (remainingBackupCodes) {
    await prisma.user.update({ where: { id: user.id }, data: { mfaBackupCodes: remainingBackupCodes } });
    await writeAuditLog({ userId: user.id, action: "MFA_BACKUP_CODE_USED", ...reqMeta(req) });
  }

  const sessionToken = randomBytes(32).toString("base64url");
  const meta = reqMeta(req);

  await prisma.adminSession.create({
    data: {
      userId: user.id,
      tokenHash: hashSessionToken(sessionToken),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: "ADMIN_LOGIN",
    ...meta,
  });

  res.json({
    sessionToken,
    expiresInSeconds: SESSION_TTL_MS / 1000,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

/**
 * Shared lookup: opaque token → live AdminSession row + user, or null.
 * Enforces expiry, revocation, and current ADMIN role/ban status.
 */
async function resolveSessionRecord(token: string) {
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: {
      user: {
        select: { ...ADMIN_USER_SELECT, isBanned: true, deletedAt: true },
      },
    },
  });

  if (
    !session ||
    session.revokedAt !== null ||
    session.expiresAt <= new Date() ||
    session.user.isBanned ||
    session.user.deletedAt !== null ||
    session.user.role !== "ADMIN"
  ) {
    return null;
  }

  return session;
}

/** GET /api/auth/admin/session — resolve the session, mint a fresh proxy JWT. */
export async function getAdminSessionInfo(req: Request, res: Response): Promise<void> {
  const token = req.header(SESSION_HEADER);
  if (!token || token.length > 128) {
    res.status(401).json({ error: "No admin session." });
    return;
  }

  const session = await resolveSessionRecord(token);
  if (!session) {
    res.status(401).json({ error: "Admin session invalid or expired." });
    return;
  }

  // Touch lastSeenAt (fire-and-forget; failure shouldn't block the request).
  prisma.adminSession
    .update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => undefined);

  res.json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
    },
    // Fresh 15-min JWT per resolve — used server-side by the admin app to call
    // admin backend endpoints. Never stored, never sent to the browser.
    accessToken: issueAccessToken(session.user.id, session.user.role),
  });
}

/** DELETE /api/auth/admin/session — revoke the presented session. */
export async function revokeAdminSession(req: Request, res: Response): Promise<void> {
  const token = req.header(SESSION_HEADER);
  if (token && token.length <= 128) {
    const result = await prisma.adminSession.updateMany({
      where: { tokenHash: hashSessionToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count > 0) {
      await writeAuditLog({ action: "ADMIN_LOGOUT", ...reqMeta(req) });
    }
  }
  // Idempotent: always succeed so logout can't fail client-side.
  res.json({ ok: true });
}

/**
 * Revoke every admin session for a user. Call this wherever an admin account
 * is banned, deleted, or demoted so console access dies immediately.
 * (resolveSessionRecord also re-checks role/ban per request as defense in depth.)
 */
export async function revokeAllAdminSessionsForUser(userId: string): Promise<number> {
  const result = await prisma.adminSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}
