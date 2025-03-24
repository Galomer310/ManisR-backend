// backend/src/routes/registerDetails.ts

import { Router } from "express";
import { registerDetails } from "../controllers/authController";

const router = Router();

// POST /auth/register-details - Save final registration details
router.post("/register-details", registerDetails);

export default router;
