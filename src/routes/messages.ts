// backend/src/routes/messages.ts
import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messageController";

const router = Router();

// Send a new message.
router.post("/", sendMessage);
// Retrieve messages for a conversation.
router.get("/:conversationId", getMessages);

export default router;
