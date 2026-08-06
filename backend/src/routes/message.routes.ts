import { createSecureRouter, Permission } from "../middleware/permissions.middleware";
import {
  getConversation,
  sendMessage,
} from "../controllers/message.controller";

const router = createSecureRouter();

router.get("/:conversationId", Permission.auth(), getConversation);
router.post("/:conversationId", Permission.auth(), sendMessage);

export default router;
