// backend/src/routes/auth.ts
import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { verifyEmail } from "../controllers/verifyEmailController";

const router = Router();

// Endpoint to register a new user.
router.post("/register", registerUser);
// Endpoint to log in a user.
router.post("/login", loginUser);
// Endpoint to verify the email using a token.
router.get("/verify-email", verifyEmail);

export default router;
