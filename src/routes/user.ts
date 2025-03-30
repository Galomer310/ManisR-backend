// backend/src/routes/user.ts
import { Router } from "express";
import { getUserProfile, updateAvatar } from "../controllers/userController";
import { verifyJWT } from "../middlewares/authMiddleware";
import upload from "../middlewares/upload";

const router = Router();

// Protected route to get the current user's profile
router.get("/profile", verifyJWT, getUserProfile);

// Protected route to update avatar; expects field name "avatar"
router.put("/avatar", verifyJWT, upload.single("avatar"), updateAvatar);

export default router;
