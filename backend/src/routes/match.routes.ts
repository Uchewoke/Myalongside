import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import {
  createMatch,
  listMyMatches,
  updateMatchStatus,
} from "../controllers/match.controller";

const router = createSecureRouter();

router.post("/", Permission.auth(), createMatch);
router.get("/", Permission.auth(), listMyMatches);
router.patch("/:id/status", Permission.auth(), updateMatchStatus);

export default router;
