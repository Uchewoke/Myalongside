/**
 * Subscription paywall middleware.
 *
 * requireFeature(feature) — 402s any caller whose live subscription tier does
 * not include `feature`. Runs AFTER requireAuth. The tier is read from the DB
 * (not the JWT) so an old access token issued while the user was PLUS cannot be
 * replayed after a downgrade, and vice-versa.
 */

import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { hasFeature, Feature } from "../lib/features";
import { AuthRequest } from "./auth.middleware";

export function requireFeature(feature: Feature) {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const userId = req.auth?.sub;
    if (!userId) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    // Admins bypass the paywall.
    if (req.auth?.role === "ADMIN") {
      next();
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      res.status(401).json({ error: "Account not found." });
      return;
    }

    if (!hasFeature(user, feature)) {
      res.status(402).json({
        error: "This feature requires an upgraded plan.",
        feature,
        requiredUpgrade: true,
      });
      return;
    }

    next();
  };
}
