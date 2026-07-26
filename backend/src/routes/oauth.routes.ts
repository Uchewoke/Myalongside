import { Router } from "express";
import { startOAuth, handleOAuthCallback, exchangeOAuthCode } from "../controllers/oauth.controller";

const router = Router();

router.get("/google", startOAuth("google"));
router.get("/google/callback", handleOAuthCallback("google"));
router.get("/facebook", startOAuth("facebook"));
router.get("/facebook/callback", handleOAuthCallback("facebook"));

router.post("/oauth/exchange", exchangeOAuthCode);

export default router;
