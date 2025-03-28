// backend/src/routes/preferences.ts
import { Router } from "express";
import { savePreferences, getPreferences } from "../controllers/preferencesController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Save or update preferences (protected)
router.post("/", verifyJWT, savePreferences);

// Retrieve preferences for a user (protected)
router.get("/:userId", verifyJWT, getPreferences);

export default router;
