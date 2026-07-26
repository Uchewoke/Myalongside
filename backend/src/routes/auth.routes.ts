import { Router } from "express";
import {
	signup,
	login,
	refreshToken,
	logout,
	getProfile,
	updateProfile,
	deleteProfile,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import {
	createAdminSession,
	getAdminSessionInfo,
	revokeAdminSession,
} from "../controllers/admin-session.controller";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/profile", requireAuth, getProfile);
router.patch("/profile", requireAuth, updateProfile);
router.delete("/profile", requireAuth, deleteProfile);

// Admin console sessions (opaque server-side tokens; see admin-session.controller)
router.post("/admin/session", createAdminSession);
router.get("/admin/session", getAdminSessionInfo);
router.delete("/admin/session", revokeAdminSession);

export default router;
