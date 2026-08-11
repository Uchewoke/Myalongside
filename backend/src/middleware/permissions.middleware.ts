/**
 * Deny-by-default routing.
 *
 * Every route MUST be registered through `createSecureRouter()` and MUST pass
 * a `Permission.*(...)` declaration as its first middleware. The wrapper
 * throws synchronously at route-registration time (i.e. at process startup,
 * before any request is served) if a route is registered without one — a
 * missing check fails closed by refusing to boot, not by silently exposing
 * the route.
 *
 * `Permission.public()` is the explicit opt-out: routes that are
 * intentionally unauthenticated (login, signup, OAuth start, Stripe webhook,
 * health check, ...) still must declare it, so "no permission" is always a
 * deliberate, reviewable statement rather than an oversight.
 */

import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import {
  AuthRequest,
  requireAuth,
  requireRole,
  requireAdminUser,
  requireAdminServiceToken,
} from "./auth.middleware";
import { resolveMfaSubject } from "./mfa.middleware";

const PERMISSION_BRAND = Symbol("permissionDeclared");

export type PermissionDeclaration = RequestHandler[] & {
  [PERMISSION_BRAND]: true;
};

function brand(handlers: RequestHandler[]): PermissionDeclaration {
  const declaration = handlers as PermissionDeclaration;
  Object.defineProperty(declaration, PERMISSION_BRAND, {
    value: true,
    enumerable: false,
  });
  return declaration;
}

function isPermissionDeclaration(value: unknown): value is PermissionDeclaration {
  return Array.isArray(value) && (value as Partial<PermissionDeclaration>)[PERMISSION_BRAND] === true;
}

// Marks the request as having passed through a declared permission check.
// Always the first middleware in every declaration, run before any actual
// authorization logic, so the flag is set even if a later check rejects it.
const mark: RequestHandler = (req: AuthRequest, _res: Response, next: NextFunction) => {
  req.permissionDeclared = true;
  next();
};

export const Permission = {
  /** Explicitly unauthenticated route. Must still be declared. */
  public(...extra: RequestHandler[]): PermissionDeclaration {
    return brand([mark, ...extra]);
  },
  /** Any authenticated user. */
  auth(...extra: RequestHandler[]): PermissionDeclaration {
    return brand([mark, requireAuth, ...extra]);
  },
  /** Authenticated user holding one of the given roles. */
  role(roles: string[], ...extra: RequestHandler[]): PermissionDeclaration {
    return brand([mark, requireAuth, requireRole(...roles), ...extra]);
  },
  /** Authenticated ADMIN user. */
  admin(...extra: RequestHandler[]): PermissionDeclaration {
    return brand([mark, requireAdminUser, ...extra]);
  },
  /** Server-to-server call authenticated by the shared admin service token. */
  adminService(...extra: RequestHandler[]): PermissionDeclaration {
    return brand([mark, requireAdminServiceToken, ...extra]);
  },
  /** Either a normal session or a short-lived MFA setup ticket (see mfa.middleware.ts). */
  mfaSubject(...extra: RequestHandler[]): PermissionDeclaration {
    return brand([mark, resolveMfaSubject, ...extra]);
  },
};

/** Marks a route registered directly on `app` (outside a secure router) as reviewed. */
export function declarePublic(req: Request, _res: Response, next: NextFunction): void {
  (req as AuthRequest).permissionDeclared = true;
  next();
}

const ROUTE_METHODS = ["get", "post", "put", "patch", "delete", "all"] as const;

/**
 * Drop-in replacement for `express.Router()` that refuses to register a
 * route unless its first middleware is a `Permission.*(...)` declaration.
 */
export function createSecureRouter(): Router {
  const router = Router();

  for (const method of ROUTE_METHODS) {
    const original = router[method].bind(router);
    (router[method] as unknown) = (path: unknown, ...handlers: unknown[]) => {
      const [declaration] = handlers;
      if (!isPermissionDeclaration(declaration)) {
        throw new Error(
          `Deny-by-default violation: route ${method.toUpperCase()} ${String(path)} ` +
            "is missing an explicit Permission declaration (e.g. Permission.auth(), " +
            "Permission.public()) as its first middleware. Refusing to register."
        );
      }
      return (original as (...args: unknown[]) => Router)(path, ...handlers);
    };
  }

  return router;
}

/**
 * Final safety net, mounted after all routes and before the 404 handler.
 * Catches any request that reached this point without ever running a
 * declared permission check (e.g. a handler that bypassed the secure router
 * and called `next()` instead of responding) and fails closed with 403
 * instead of letting it fall through.
 */
export function denyUndeclared(req: Request, res: Response, next: NextFunction): void {
  if (!(req as AuthRequest).permissionDeclared) {
    res.status(403).json({ error: "Access denied: no permission declared for this route." });
    return;
  }
  next();
}
