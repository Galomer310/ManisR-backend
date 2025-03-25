// backend/src/routes/preferences.ts
import { Router } from "express";
import { savePreferences, getPreferences } from "../controllers/preferencesController";

const router = Router();

// Save or update preferences.
router.post("/", savePreferences);
// Retrieve preferences for a specific user.
router.get("/:userId", getPreferences);

export default router;
