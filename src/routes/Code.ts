// backend/src/routes/code.ts
import { Router } from "express";
import { sendCode, verifyCode } from "../controllers/CodeController";

const router = Router();

// Endpoint to send a verification code
router.post("/send-code", sendCode);

// Endpoint to verify the provided code (and get JWT)
router.post("/verify-code", verifyCode);

export default router;
