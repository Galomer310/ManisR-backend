// backend/src/routes/preferences.ts
import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware";
import { savePreferences, getPreferences } from "../controllers/preferencesController";

const router = Router();

// Protected routes
router.post("/", verifyJWT, savePreferences);
router.get("/:userId", verifyJWT, getPreferences);

export default router;
