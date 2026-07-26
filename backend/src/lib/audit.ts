/**
 * Audit logging — writes tamper-evident records of security-relevant events.
 * Failures are logged to stderr but never propagate to callers.
 */

import type { Request } from "express";
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
  | "ADMIN_LOGOUT"
  | "SUGGESTION_ACCEPT"
  | "TOKEN_REUSE_DETECTED"
  | "SUSPICIOUS_ACCESS";

export interface AuditEntry {
  userId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
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

/** Write a single audit record. Never throws. */
export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        resource: entry.resource ?? null,
        resourceId: entry.resourceId ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        metadata: (entry.metadata ?? {}) as any,
      },
    });
  } catch {
    console.error("[audit] Failed to write log:", entry.action, entry.userId);
  }
}
