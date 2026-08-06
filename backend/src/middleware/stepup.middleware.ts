/**
 * Step-up re-authentication for destructive admin actions (role grants, data
 * export, impersonation, ...). A valid admin session isn't enough — the caller
 * must also prove fresh possession of their MFA factor via the `x-stepup-code`
 * header (a live TOTP code, or a one-time backup code) on every such request.
 */

import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "./auth.middleware";
import { verifyTotp, consumeBackupCode } from "../lib/mfa";
import { writeAuditLog, reqMeta } from "../lib/audit";

const STEPUP_HEADER = "x-stepup-code";

export function requireStepUp() {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.auth?.sub;
    if (!userId) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    const code = req.header(STEPUP_HEADER);
    if (!code) {
      res.status(401).json({ error: "Step-up verification required.", stepUpHeader: STEPUP_HEADER });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaEnabled: true, mfaSecret: true, mfaBackupCodes: true },
    });

    if (!user?.mfaEnabled || !user.mfaSecret) {
      res.status(403).json({ error: "MFA must be enabled to perform this action." });
      return;
    }

    if (verifyTotp(user.mfaSecret, code)) {
      req.stepUpVerifiedAt = Date.now();
      void writeAuditLog({ userId, action: "STEP_UP_VERIFIED", resource: req.path, ...reqMeta(req) });
      next();
      return;
    }

    const remainingCodes = await consumeBackupCode(user.mfaBackupCodes, code);
    if (remainingCodes) {
      await prisma.user.update({ where: { id: userId }, data: { mfaBackupCodes: remainingCodes } });
      req.stepUpVerifiedAt = Date.now();
      void writeAuditLog({ userId, action: "MFA_BACKUP_CODE_USED", resource: req.path, ...reqMeta(req) });
      void writeAuditLog({ userId, action: "STEP_UP_VERIFIED", resource: req.path, ...reqMeta(req) });
      next();
      return;
    }

    void writeAuditLog({ userId, action: "STEP_UP_FAILED", resource: req.path, ...reqMeta(req) });
    res.status(401).json({ error: "Step-up verification failed." });
  };
}
