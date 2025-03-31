// backend/src/routes/mealHistory.ts
import { Router } from "express";
import { archiveMeal, getUsageHistory, deleteUsageHistory } from "../controllers/mealHistoryController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Archive a meal (call this endpoint after a review is completed).
router.post("/archive/:mealId", verifyJWT, archiveMeal);

// Get usage history for the current user.
router.get("/", verifyJWT, getUsageHistory);

// Delete a specific history record.
router.delete("/:id", verifyJWT, deleteUsageHistory);

export default router;
