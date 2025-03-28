// backend/src/routes/messages.ts
import { Router } from "express";
import { sendMessage, getMessages, getMyConversations } from "../controllers/messageController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Send a new message (protected)
router.post("/", verifyJWT, sendMessage);

// Retrieve messages for a specific conversation (protected)
router.get("/:conversationId", verifyJWT, getMessages);

// Retrieve all conversations for the current user (protected)
router.get("/myConversations", verifyJWT, getMyConversations);

export default router;
