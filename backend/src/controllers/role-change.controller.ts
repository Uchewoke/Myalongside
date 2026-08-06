/**
 * Dual-control role changes: one admin proposes, a DIFFERENT admin approves.
 * No one can target themselves, and the requester can never approve their
 * own request — both are enforced here, not just left to the schema.
 */

import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { writeAuditLog, writeAuditLogTx, reqMeta } from "../lib/audit";
import { revokeAllAdminSessionsForUser } from "./admin-session.controller";

const ROLES = ["SEEKER", "MENTOR", "ADMIN"] as const;

const requestSchema = z.object({
  targetUserId: z.string().min(1),
  requestedRole: z.enum(ROLES),
  reason: z.string().min(10).max(1000),
});

const decisionSchema = z.object({
  decisionNote: z.string().max(1000).optional(),
});

/** POST /api/admin/role-changes — an admin proposes a role change for another user. */
export async function requestRoleChange(req: AuthRequest, res: Response): Promise<void> {
  const requesterId = req.auth!.sub;
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "targetUserId, requestedRole, and a reason (10+ chars) are required." });
    return;
  }
  const { targetUserId, requestedRole, reason } = parsed.data;

  if (targetUserId === requesterId) {
    await writeAuditLog({
      userId: requesterId,
      action: "ROLE_CHANGE_SELF_ESCALATION_BLOCKED",
      resourceId: targetUserId,
      metadata: { requestedRole },
      ...reqMeta(req),
    });
    res.status(403).json({ error: "Admins cannot request a role change for themselves." });
    return;
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
  if (!target) {
    res.status(404).json({ error: "Target user not found." });
    return;
  }
  if (target.role === requestedRole) {
    res.status(400).json({ error: "User already has this role." });
    return;
  }

  const request = await prisma.roleChangeRequest.create({
    data: {
      targetUserId,
      currentRole: target.role,
      requestedRole,
      reason,
      requestedById: requesterId,
    },
  });

  await writeAuditLog({
    userId: requesterId,
    action: "ROLE_CHANGE_REQUESTED",
    resourceId: request.id,
    metadata: { targetUserId, currentRole: target.role, requestedRole },
    ...reqMeta(req),
  });

  res.status(201).json({ request });
}

/** GET /api/admin/role-changes — list pending (or all, via ?status=) requests. */
export async function listRoleChangeRequests(req: AuthRequest, res: Response): Promise<void> {
  const statusParam = typeof req.query.status === "string" ? req.query.status.toUpperCase() : "PENDING";
  const status = ["PENDING", "APPROVED", "REJECTED"].includes(statusParam)
    ? (statusParam as "PENDING" | "APPROVED" | "REJECTED")
    : "PENDING";

  const requests = await prisma.roleChangeRequest.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    include: {
      targetUser: { select: { id: true, name: true, email: true, role: true } },
      requestedBy: { select: { id: true, name: true, email: true } },
      approvedBy: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ requests });
}

/** POST /api/admin/role-changes/:id/approve — requires step-up; a second, different admin only. */
export async function approveRoleChange(req: AuthRequest, res: Response): Promise<void> {
  const approverId = req.auth!.sub;
  const { id } = req.params as { id: string };
  const parsed = decisionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }

  const request = await prisma.roleChangeRequest.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING") {
    res.status(404).json({ error: "No pending role change request with that id." });
    return;
  }

  if (request.requestedById === approverId) {
    await writeAuditLog({
      userId: approverId,
      action: "ROLE_CHANGE_SELF_APPROVAL_BLOCKED",
      resourceId: request.id,
      ...reqMeta(req),
    });
    res.status(403).json({ error: "A different admin must approve this request." });
    return;
  }

  const meta = reqMeta(req);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: request.targetUserId }, data: { role: request.requestedRole } });
    await tx.roleChangeRequest.update({
      where: { id: request.id },
      data: {
        status: "APPROVED",
        approvedById: approverId,
        decisionNote: parsed.data.decisionNote,
        decidedAt: new Date(),
      },
    });
    await writeAuditLogTx(tx, {
      userId: approverId,
      action: "ROLE_CHANGE_APPROVED",
      resourceId: request.id,
      resource: request.targetUserId,
      beforeState: { role: request.currentRole },
      afterState: { role: request.requestedRole },
      metadata: { requestedBy: request.requestedById },
      ...meta,
    });
  });

  // Role changed away from (or into) ADMIN — kill any existing admin console
  // sessions for the target so the change takes effect immediately.
  await revokeAllAdminSessionsForUser(request.targetUserId);

  res.json({ approved: true });
}

/** POST /api/admin/role-changes/:id/reject */
export async function rejectRoleChange(req: AuthRequest, res: Response): Promise<void> {
  const reviewerId = req.auth!.sub;
  const { id } = req.params as { id: string };
  const parsed = decisionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }

  const request = await prisma.roleChangeRequest.findUnique({ where: { id } });
  if (!request || request.status !== "PENDING") {
    res.status(404).json({ error: "No pending role change request with that id." });
    return;
  }

  await prisma.roleChangeRequest.update({
    where: { id: request.id },
    data: {
      status: "REJECTED",
      approvedById: reviewerId,
      decisionNote: parsed.data.decisionNote,
      decidedAt: new Date(),
    },
  });

  await writeAuditLog({
    userId: reviewerId,
    action: "ROLE_CHANGE_REJECTED",
    resourceId: request.id,
    resource: request.targetUserId,
    ...reqMeta(req),
  });

  res.json({ rejected: true });
}
