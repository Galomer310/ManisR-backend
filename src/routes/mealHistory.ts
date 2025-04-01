// backend/src/routes/mealHistory.ts
import { Router } from "express";
import { archiveMeal, getUsageHistory, softDeleteUsageHistory, updateMealHistoryReview  } from "../controllers/mealHistoryController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Archive a meal
router.post("/archive/:mealId", verifyJWT, archiveMeal);

// Get usage history for the current user.
router.get("/", verifyJWT, getUsageHistory);

// Update the review fields for a given meal_history record.
router.put("/:id/review", verifyJWT, updateMealHistoryReview);

// Soft delete a specific history record.
router.delete("/:id", verifyJWT, softDeleteUsageHistory);

export default router;
