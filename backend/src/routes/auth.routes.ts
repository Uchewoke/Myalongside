import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import {
	signup,
	login,
	refreshToken,
	logout,
	getProfile,
	updateProfile,
	deleteProfile,
} from "../controllers/auth.controller";
import {
	createAdminSession,
	getAdminSessionInfo,
	revokeAdminSession,
} from "../controllers/admin-session.controller";

const router = createSecureRouter();

router.post("/signup", Permission.public(), signup);
router.post("/login", Permission.public(), login);
router.post("/refresh", Permission.public(), refreshToken);
router.post("/logout", Permission.public(), logout);
router.get("/profile", Permission.auth(), getProfile);
router.patch("/profile", Permission.auth(), updateProfile);
router.delete("/profile", Permission.auth(), deleteProfile);

// Admin console sessions — the controller does its own credential/session-token checks.
router.post("/admin/session", Permission.public(), createAdminSession);
router.get("/admin/session", Permission.public(), getAdminSessionInfo);
router.delete("/admin/session", Permission.public(), revokeAdminSession);

export default router;
