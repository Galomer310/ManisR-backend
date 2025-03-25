// backend/src/routes/messages.ts
import { Router } from "express";
import { sendMessage, getMessages } from "../controllers/messageController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Protected endpoint: send a new message.
router.post("/", verifyJWT, sendMessage);

// Protected endpoint: retrieve messages for a conversation.
router.get("/:conversationId", verifyJWT, getMessages);

export default router;
