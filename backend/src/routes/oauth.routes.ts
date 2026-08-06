import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import { startOAuth, handleOAuthCallback, exchangeOAuthCode } from "../controllers/oauth.controller";

const router = createSecureRouter();

router.get("/google", Permission.public(), startOAuth("google"));
router.get("/google/callback", Permission.public(), handleOAuthCallback("google"));
router.get("/facebook", Permission.public(), startOAuth("facebook"));
router.get("/facebook/callback", Permission.public(), handleOAuthCallback("facebook"));

router.post("/oauth/exchange", Permission.public(), exchangeOAuthCode);

export default router;
