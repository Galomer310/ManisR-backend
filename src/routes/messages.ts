import { Router } from "express";
import { sendMessage, getMessages, getMyConversations } from "../controllers/messageController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Protected route: send a new message
router.post("/", verifyJWT, sendMessage);

// Protected route: retrieve messages for a specific conversation
router.get("/:conversationId", verifyJWT, getMessages);

// Protected route: retrieve all conversations for the user
router.get("/myConversations", verifyJWT, getMyConversations);

export default router;
