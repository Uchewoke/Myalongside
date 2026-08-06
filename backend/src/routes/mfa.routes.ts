import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import { requireStepUp } from "../middleware/stepup.middleware";
import { startMfaEnrollment, verifyMfaEnrollment, disableMfa } from "../controllers/mfa.controller";

const router = createSecureRouter();

router.post("/enroll", Permission.mfaSubject(), startMfaEnrollment);
router.post("/verify", Permission.mfaSubject(), verifyMfaEnrollment);
router.post("/disable", Permission.auth(requireStepUp()), disableMfa);

export default router;
