import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import {
  createCheckIn,
  listCheckIns,
  getMoodTrends,
} from "../controllers/checkin.controller";

const router = createSecureRouter();

/**
 * Log a self-guided mood check-in.
 * POST /api/checkins
 * Free tier is capped at 3/week; enforced inside the controller since it's
 * a quantity limit rather than a boolean feature gate.
 */
router.post("/", Permission.auth(), createCheckIn);

/**
 * List the current user's check-ins.
 * GET /api/checkins?limit=30
 */
router.get("/", Permission.auth(), listCheckIns);

/**
 * Mood trend aggregation over the last 90 days.
 * GET /api/checkins/mood-trends
 */
router.get("/mood-trends", Permission.feature("mood-trends"), getMoodTrends);

export default router;
