import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import { listMentors, getMentor, rankedMentorSearch } from "../controllers/mentor.controller";

const router = createSecureRouter();

router.get("/search", Permission.auth(), rankedMentorSearch);
router.get("/", Permission.auth(), listMentors);
router.get("/:id", Permission.auth(), getMentor);

export default router;
