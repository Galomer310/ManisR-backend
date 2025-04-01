import { Router } from "express";
import { savePreferences, getPreferences, updatePreferences } from "../controllers/preferencesController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Save or update preferences (protected)
router.post("/", verifyJWT, savePreferences);

// Retrieve preferences for a user (protected)
router.get("/:userId", verifyJWT, getPreferences);

// Update preferences for a user (protected) using PUT:
router.put("/:userId", verifyJWT, updatePreferences);

export default router;
