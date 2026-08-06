/**
 * Audit logging — writes tamper-evident records of security-relevant events.
 * Failures are logged to stderr but never propagate to callers.
 */

import type { Request } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "SIGNUP"
  | "TOKEN_REFRESH"
  | "PROFILE_UPDATE"
  | "ACCOUNT_DELETE"
  | "MATCH_CREATE"
  | "MATCH_STATUS_UPDATE"
  | "MESSAGE_SEND"
  | "REPORT_CREATE"
  | "ADMIN_BAN_USER"
  | "ADMIN_UNBAN_USER"
  | "ADMIN_LOGIN"
  | "ADMIN_LOGIN_FAILED"
  | "ADMIN_LOGIN_DENIED_NOT_ADMIN"
  | "ADMIN_LOGIN_DENIED_MFA_REQUIRED"
  | "ADMIN_LOGIN_MFA_FAILED"
  | "ADMIN_LOGOUT"
  | "SUGGESTION_ACCEPT"
  | "TOKEN_REUSE_DETECTED"
  | "SUSPICIOUS_ACCESS"
  | "MENTOR_LEAD_CAPTURED"
  | "MENTOR_LEAD_STATUS_UPDATE"
  | "MENTOR_LEAD_CONVERTED"
  | "MFA_ENROLL_STARTED"
  | "MFA_ENROLLED"
  | "MFA_DISABLED"
  | "MFA_BACKUP_CODE_USED"
  | "STEP_UP_VERIFIED"
  | "STEP_UP_FAILED"
  | "ROLE_CHANGE_REQUESTED"
  | "ROLE_CHANGE_APPROVED"
  | "ROLE_CHANGE_REJECTED"
  | "ROLE_CHANGE_SELF_ESCALATION_BLOCKED"
  | "ROLE_CHANGE_SELF_APPROVAL_BLOCKED"
  | "DATA_EXPORT"
  | "IMPERSONATION_START"
  | "IMPERSONATION_END"
  | "IMPERSONATION_BLOCKED_ADMIN_ROUTE";

export interface AuditEntry {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
}

function extractIp(req: Request): string | undefined {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress;
}

/** Extract IP + UA from an Express request for use in audit entries. */
export function reqMeta(req: Request): Pick<AuditEntry, "ipAddress" | "userAgent"> {
  return {
    ipAddress: extractIp(req),
    userAgent: req.headers["user-agent"]?.slice(0, 300),
  };
}

function toData(entry: AuditEntry) {
  return {
    userId: entry.userId ?? null,
    action: entry.action,
    resource: entry.resource ?? null,
    resourceId: entry.resourceId ?? null,
    ipAddress: entry.ipAddress ?? null,
    userAgent: entry.userAgent ?? null,
    metadata: (entry.metadata ?? {}) as any,
    beforeState: (entry.beforeState ?? null) as any,
    afterState: (entry.afterState ?? null) as any,
  };
}

/** Write a single audit record. Never throws. */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({ data: toData(entry) });
  } catch {
    console.error("[audit] Failed to write log:", entry.action, entry.userId);
  }
}

/**
 * Write a privileged-action audit record inside the SAME transaction as the
 * change it describes, so the change and its audit trail commit or roll back
 * together — the log can never end up out of sync with what actually happened.
 */
export async function writeAuditLogTx(
  tx: Prisma.TransactionClient,
  entry: AuditEntry
): Promise<void> {
  await tx.auditLog.create({ data: toData(entry) });
}

