// backend/src/routes/auth.ts
import { Router } from "express";
import { sendCode, verifyCode } from "../controllers/CodeController";
import { registerDetails } from "../controllers/authController";

const router = Router();

router.post("/send-code", sendCode);
router.post("/verify-code", verifyCode);
router.post("/register-details", registerDetails);

export default router;
