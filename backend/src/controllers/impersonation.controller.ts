/**
 * "Log in as user" for support/debugging. Time-boxed (15 min), reason
 * required, loudly audited, and never permitted against another admin
 * account (no privilege-escalation vector via impersonation). The issued
 * token is non-transitive: requireAuth/requireAdminUser reject it on any
 * admin route (see auth.middleware.ts).
 */

import { Response } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { writeAuditLog, reqMeta } from "../lib/audit";
import { issueImpersonationToken } from "./auth.controller";

const IMPERSONATION_TTL_MS = 15 * 60 * 1000;

const startSchema = z.object({
  targetUserId: z.string().min(1),
  reason: z.string().min(10).max(1000),
});

/** POST /api/admin/impersonation — requires step-up. */
export async function startImpersonation(req: AuthRequest, res: Response): Promise<void> {
  const adminId = req.auth!.sub;
  const parsed = startSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "targetUserId and a reason (10+ chars) are required." });
    return;
  }
  const { targetUserId, reason } = parsed.data;

  if (targetUserId === adminId) {
    res.status(400).json({ error: "Cannot impersonate yourself." });
    return;
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, isBanned: true, deletedAt: true },
  });
  if (!target || target.deletedAt) {
    res.status(404).json({ error: "Target user not found." });
    return;
  }
  // Never allow escalation-by-impersonation: an admin can never assume
  // another admin's identity through this flow.
  if (target.role === "ADMIN") {
    res.status(403).json({ error: "Cannot impersonate another admin account." });
    return;
  }

  const tokenId = randomUUID();
  const expiresAt = new Date(Date.now() + IMPERSONATION_TTL_MS);
  const meta = reqMeta(req);

  await prisma.impersonationSession.create({
    data: {
      adminUserId: adminId,
      targetUserId,
      reason,
      tokenId,
      expiresAt,
      ipAddress: meta.ipAddress ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  const token = issueImpersonationToken(targetUserId, target.role, adminId, tokenId);

  // Loud: this is a high-sensitivity action — audit trail AND server log.
  console.warn(
    `[IMPERSONATION_START] admin=${adminId} target=${targetUserId} reason="${reason}" expiresAt=${expiresAt.toISOString()}`
  );
  await writeAuditLog({
    userId: adminId,
    action: "IMPERSONATION_START",
    resourceId: targetUserId,
    metadata: { reason, tokenId, expiresAt: expiresAt.toISOString() },
    ...meta,
  });

  res.status(201).json({ token, expiresAt, expiresInSeconds: IMPERSONATION_TTL_MS / 1000 });
}

/**
 * POST /api/admin/impersonation/:id/end — any admin can kill an active
 * impersonation session early (incident-response kill switch), not just
 * the admin who started it.
 */
export async function endImpersonation(req: AuthRequest, res: Response): Promise<void> {
  const adminId = req.auth!.sub;
  const { id } = req.params as { id: string };

  const session = await prisma.impersonationSession.findUnique({ where: { id } });
  if (!session || session.endedAt) {
    res.status(404).json({ error: "No active impersonation session with that id." });
    return;
  }

  await prisma.impersonationSession.update({ where: { id }, data: { endedAt: new Date() } });

  console.warn(`[IMPERSONATION_END] endedBy=${adminId} session=${id} target=${session.targetUserId}`);
  await writeAuditLog({
    userId: adminId,
    action: "IMPERSONATION_END",
    resourceId: session.targetUserId,
    metadata: { sessionId: id, startedBy: session.adminUserId },
    ...reqMeta(req),
  });

  res.json({ ended: true });
}

/** GET /api/admin/impersonation — list active (non-ended, non-expired) sessions. */
export async function listActiveImpersonations(_req: AuthRequest, res: Response): Promise<void> {
  const sessions = await prisma.impersonationSession.findMany({
    where: { endedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    include: {
      adminUser: { select: { id: true, name: true, email: true } },
      targetUser: { select: { id: true, name: true, email: true } },
    },
  });
  res.json({ sessions });
}
