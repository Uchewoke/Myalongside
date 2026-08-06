import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { writeAuditLog, reqMeta } from "../lib/audit";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set.`);
  return value;
}

const JWT_SECRET = requireEnv("JWT_SECRET");
const ADMIN_SERVICE_TOKEN = process.env.ADMIN_SERVICE_TOKEN;

export interface AuthPayload {
  sub: string;
  role: string;
  jti: string; // unique token ID for audit trails & future revocation
  /** Set only on "log in as user" tokens minted by impersonation.controller.ts. */
  impersonating?: boolean;
  impersonatedBy?: string;
}

export interface AuthRequest extends Request {
  auth?: AuthPayload;
  requestId?: string;
  /** Set by permissions.middleware.ts once a route's Permission declaration has run. */
  permissionDeclared?: boolean;
  /** Timestamp (ms) set by stepup.middleware.ts once a fresh MFA code has been verified for this request. */
  stepUpVerifiedAt?: number;
  /** Set by mfa.middleware.ts: the user id enrolling/verifying MFA (session or setup-ticket derived). */
  mfaUserId?: string;
}

// ── Core auth middleware ───────────────────────────────────────────────────────

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.jti !== "string"
    ) {
      res.status(401).json({ error: "Invalid or expired token." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isBanned: true, deletedAt: true },
    });

    if (!user) {
      res.status(401).json({ error: "Account not found." });
      return;
    }
    if (user.deletedAt) {
      res.status(410).json({ error: "Account deactivated." });
      return;
    }
    if (user.isBanned) {
      res.status(403).json({ error: "Account suspended." });
      return;
    }

    const impersonating = payload.impersonating === true;
    if (impersonating) {
      // Impersonation tokens are re-validated against their DB session on every
      // request, so ending the session (or its natural expiry) revokes access
      // immediately instead of waiting out the JWT's own exp claim.
      const session = await prisma.impersonationSession.findUnique({
        where: { tokenId: payload.jti },
        select: { expiresAt: true, endedAt: true },
      });
      if (!session || session.endedAt !== null || session.expiresAt <= new Date()) {
        res.status(401).json({ error: "Impersonation session ended or expired." });
        return;
      }
    }

    req.auth = {
      sub: payload.sub,
      role: payload.role,
      jti: payload.jti,
      impersonating,
      impersonatedBy: typeof payload.impersonatedBy === "string" ? payload.impersonatedBy : undefined,
    };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

// ── Role checks ───────────────────────────────────────────────────────────────

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      res.status(403).json({ error: "Insufficient permissions." });
      return;
    }
    next();
  };
}

export function requireAdminUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  requireAuth(req, res, () => {
    // Non-transitive: an impersonated session can never reach admin routes,
    // no matter what role claim it carries.
    if (req.auth?.impersonating) {
      void writeAuditLog({
        userId: req.auth.sub,
        action: "IMPERSONATION_BLOCKED_ADMIN_ROUTE",
        resource: req.path,
        metadata: { impersonatedBy: req.auth.impersonatedBy },
        ...reqMeta(req),
      });
      res.status(403).json({ error: "Impersonated sessions cannot access admin routes." });
      return;
    }
    if (req.auth?.role !== "ADMIN") {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    next();
  });
}

export function requireAdminServiceToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const serviceToken = req.headers["x-admin-service-token"];
  if (
    typeof ADMIN_SERVICE_TOKEN !== "string" ||
    ADMIN_SERVICE_TOKEN.length === 0 ||
    serviceToken !== ADMIN_SERVICE_TOKEN
  ) {
    res.status(403).json({ error: "Service authorization required." });
    return;
  }
  next();
}

// ── Tenant isolation helpers ──────────────────────────────────────────────────
// Call these inside controllers after requireAuth to assert resource ownership
// or participation before handing data back.

/**
 * Assert that the authenticated user is one of the given participant IDs.
 * Returns false (and sends 403) if the check fails — caller should return.
 */
export function assertParticipant(
  req: AuthRequest,
  res: Response,
  participants: (string | null | undefined)[]
): boolean {
  if (req.auth?.role === "ADMIN") return true;
  const userId = req.auth?.sub;
  if (!userId || !participants.filter(Boolean).includes(userId)) {
    res.status(403).json({ error: "Access denied." });
    return false;
  }
  return true;
}

/**
 * Assert that the authenticated user owns the resource.
 * Returns false (and sends 403) if the check fails — caller should return.
 */
export function assertOwner(
  req: AuthRequest,
  res: Response,
  ownerId: string | null | undefined
): boolean {
  if (req.auth?.role === "ADMIN") return true;
  if (!req.auth?.sub || req.auth.sub !== ownerId) {
    res.status(403).json({ error: "Access denied." });
    return false;
  }
  return true;
}
