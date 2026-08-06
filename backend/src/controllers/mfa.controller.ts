/**
 * MFA (TOTP) enrollment for the authenticated user, and mandatory setup for
 * admin accounts mid-login (see admin-session.controller.ts).
 */

import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { writeAuditLog, writeAuditLogTx, reqMeta } from "../lib/audit";
import {
  generateTotpSecret,
  verifyTotp,
  buildOtpAuthUrl,
  generateBackupCodes,
} from "../lib/mfa";

const verifySchema = z.object({
  code: z.string().regex(/^\d{6}$/),
});

/** POST /api/auth/mfa/enroll — generates a pending TOTP secret (not yet active). */
export async function startMfaEnrollment(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.mfaUserId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, mfaEnabled: true } });
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  if (user.mfaEnabled) {
    res.status(400).json({ error: "MFA is already enabled. Disable it before re-enrolling." });
    return;
  }

  const secret = generateTotpSecret();
  await prisma.user.update({ where: { id: userId }, data: { mfaSecret: secret } });

  await writeAuditLog({
    userId,
    action: "MFA_ENROLL_STARTED",
    ...reqMeta(req),
  });

  res.json({ secret, otpauthUrl: buildOtpAuthUrl(user.email, secret) });
}

/** POST /api/auth/mfa/verify — confirms enrollment with a live TOTP code, activates MFA. */
export async function verifyMfaEnrollment(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.mfaUserId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A 6-digit code is required." });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { mfaSecret: true, mfaEnabled: true },
  });
  if (!user?.mfaSecret || user.mfaEnabled) {
    res.status(400).json({ error: "No pending MFA enrollment for this account." });
    return;
  }

  if (!verifyTotp(user.mfaSecret, parsed.data.code)) {
    await writeAuditLog({ userId, action: "MFA_ENROLL_STARTED", metadata: { result: "invalid_code" }, ...reqMeta(req) });
    res.status(401).json({ error: "Invalid code." });
    return;
  }

  const { plaintext, hashes } = await generateBackupCodes();
  const meta = reqMeta(req);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { mfaEnabled: true, mfaEnrolledAt: new Date(), mfaBackupCodes: hashes },
    });
    await writeAuditLogTx(tx, { userId, action: "MFA_ENROLLED", ...meta });
  });

  res.json({ enabled: true, backupCodes: plaintext });
}

/** POST /api/auth/mfa/disable — requires step-up; blocked entirely for ADMIN accounts. */
export async function disableMfa(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.auth?.sub;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "ADMIN") {
    res.status(403).json({
      error: "MFA is mandatory for admin accounts. Have another admin change your role first.",
    });
    return;
  }

  const meta = reqMeta(req);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null, mfaBackupCodes: [] },
    });
    await writeAuditLogTx(tx, { userId, action: "MFA_DISABLED", ...meta });
  });

  res.json({ disabled: true });
}
