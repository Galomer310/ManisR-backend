// backend/src/routes/mealHistory.ts
import { Router } from "express";
import { archiveMeal, getUsageHistory, softDeleteUsageHistory } from "../controllers/mealHistoryController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Archive a meal
router.post("/archive/:mealId", verifyJWT, archiveMeal);

// Get usage history for the current user.
router.get("/", verifyJWT, getUsageHistory);

// Soft delete a specific history record.
router.delete("/:id", verifyJWT, softDeleteUsageHistory);

export default router;
