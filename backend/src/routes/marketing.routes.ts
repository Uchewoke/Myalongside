import rateLimit from "express-rate-limit";
import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import { captureMentorLead, listMentorLeads, updateMentorLead } from "../controllers/mentor-lead.controller";
import { getMentorMatches, captureMentee } from "../controllers/match-finder.controller";
import { chatWithAgent, generateAdImage, streamCampaign } from "../controllers/marketing-agent.controller";

const router = createSecureRouter();

// Public capture — tight per-IP limit since it triggers a paid Claude call.
const leadCaptureLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again in a minute." },
});

router.post("/mentor-leads", Permission.public(leadCaptureLimiter), captureMentorLead);

// Admin-only: expose lead contact data and mentor matching.
router.get("/mentor-leads", Permission.admin(), listMentorLeads);
router.patch("/mentor-leads/:id", Permission.admin(), updateMentorLead);
router.get("/match", Permission.admin(), getMentorMatches);
router.post("/mentees", Permission.admin(), captureMentee);

// Admin-only: the 12-agent AI marketing team (each call costs a Claude/image-model request).
router.post("/agent", Permission.admin(), chatWithAgent);
router.post("/campaign", Permission.admin(), streamCampaign);
router.post("/generate-image", Permission.admin(), generateAdImage);

export default router;

