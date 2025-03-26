// src/routes/messages.ts
import { Router } from "express";
import { sendMessage } from "../controllers/messageController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", verifyJWT, sendMessage);

export default router;
