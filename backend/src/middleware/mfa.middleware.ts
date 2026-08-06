/**
 * Resolves who is enrolling/verifying MFA. Supports two callers:
 *  - An already-authenticated user enrolling voluntarily (normal Bearer JWT).
 *  - An admin mid-login who passed password but has no session yet, holding
 *    only the short-lived MFA setup ticket issued by admin-session.controller.ts.
 */

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "./auth.middleware";
import { verifyMfaSetupToken } from "../controllers/auth.controller";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set.`);
  return value;
}

const JWT_SECRET = requireEnv("JWT_SECRET");
const SETUP_TOKEN_HEADER = "x-mfa-setup-token";

export function resolveMfaSubject(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET) as jwt.JwtPayload;
      if (typeof payload.sub === "string" && payload.impersonating !== true) {
        req.mfaUserId = payload.sub;
        next();
        return;
      }
    } catch {
      // fall through to the setup-ticket path
    }
  }

  const setupToken = req.header(SETUP_TOKEN_HEADER);
  if (setupToken && setupToken.length <= 2048) {
    const userId = verifyMfaSetupToken(setupToken);
    if (userId) {
      req.mfaUserId = userId;
      next();
      return;
    }
  }

  res.status(401).json({ error: "Authentication required." });
}
