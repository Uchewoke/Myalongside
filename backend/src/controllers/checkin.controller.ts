import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { getCheckInWeeklyLimit, getWeekStart } from "../lib/features";

const createCheckInSchema = z.object({
  moodScore: z.number().int().min(1).max(5),
  note: z.string().max(2000).optional(),
});

const listCheckInsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(90).optional(),
});

/**
 * Log a self-guided mood check-in.
 * POST /api/checkins
 * Free tier is capped at CHECK_IN_WEEKLY_LIMIT.FREE per calendar week.
 */
export async function createCheckIn(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = createCheckInSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const userId = req.auth!.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const limit = getCheckInWeeklyLimit(user);
    if (limit !== null) {
      const weekStart = getWeekStart();
      const countThisWeek = await prisma.checkIn.count({
        where: { userId, createdAt: { gte: weekStart } },
      });

      if (countThisWeek >= limit) {
        res.status(402).json({
          error: `Free plan is limited to ${limit} check-ins per week.`,
          feature: "check-in-limit",
          requiredUpgrade: true,
        });
        return;
      }
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        userId,
        moodScore: parsed.data.moodScore,
        note: parsed.data.note,
      },
    });

    res.status(201).json(checkIn);
  } catch (error) {
    console.error("Error creating check-in:", error);
    res.status(500).json({ error: "Failed to create check-in." });
  }
}

/**
 * List the current user's check-ins, most recent first.
 * GET /api/checkins?limit=30
 */
export async function listCheckIns(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = listCheckInsSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const userId = req.auth!.sub;
    const [checkIns, user] = await Promise.all([
      prisma.checkIn.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: parsed.data.limit ?? 30,
      }),
      prisma.user.findUnique({ where: { id: userId }, select: { subscriptionTier: true } }),
    ]);

    const limit = user ? getCheckInWeeklyLimit(user) : null;
    const usedThisWeek =
      limit !== null
        ? checkIns.filter((c) => c.createdAt >= getWeekStart()).length
        : null;

    res.json({ checkIns, weeklyLimit: limit, usedThisWeek });
  } catch (error) {
    console.error("Error listing check-ins:", error);
    res.status(500).json({ error: "Failed to list check-ins." });
  }
}

/**
 * Aggregate mood check-ins into a trend line.
 * GET /api/checkins/mood-trends
 * Gated by requireFeature("mood-trends") in the router.
 */
export async function getMoodTrends(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.auth!.sub;
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 90);

    const checkIns = await prisma.checkIn.findMany({
      where: { userId, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: { moodScore: true, createdAt: true },
    });

    const points = checkIns.map((c) => ({
      date: c.createdAt.toISOString().slice(0, 10),
      moodScore: c.moodScore,
    }));

    let direction: "improving" | "steady" | "declining" | "insufficient-data" =
      "insufficient-data";

    if (checkIns.length >= 4) {
      const mid = Math.floor(checkIns.length / 2);
      const firstHalfAvg =
        checkIns.slice(0, mid).reduce((sum, c) => sum + c.moodScore, 0) / mid;
      const secondHalfAvg =
        checkIns.slice(mid).reduce((sum, c) => sum + c.moodScore, 0) /
        (checkIns.length - mid);
      const delta = secondHalfAvg - firstHalfAvg;

      direction = delta > 0.4 ? "improving" : delta < -0.4 ? "declining" : "steady";
    }

    const average =
      checkIns.length > 0
        ? checkIns.reduce((sum, c) => sum + c.moodScore, 0) / checkIns.length
        : null;

    res.json({ points, average, direction });
  } catch (error) {
    console.error("Error computing mood trends:", error);
    res.status(500).json({ error: "Failed to compute mood trends." });
  }
}

