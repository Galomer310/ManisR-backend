// backend/src/routes/preferences.ts
import { Router } from "express";
import { savePreferences, getPreferences } from "../controllers/preferencesController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Protected endpoint: only authenticated users can save/update their preferences.
router.post("/", verifyJWT, savePreferences);

// Protected endpoint: only authenticated users can retrieve their preferences.
router.get("/:userId", verifyJWT, getPreferences);

export default router;
