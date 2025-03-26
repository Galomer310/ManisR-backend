import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { verifyEmail } from "../controllers/verifyEmailController";

const router = Router();

// User registration endpoint
router.post("/register", registerUser);

// User login endpoint
router.post("/login", loginUser);

// Email verification endpoint
router.get("/verify-email", verifyEmail);

export default router;
