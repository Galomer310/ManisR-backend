import { Router } from "express";
import { archiveMeal, getUsageHistory, softDeleteUsageHistory, updateMealHistoryReview, getArchivedMealByMealId } from "../controllers/mealHistoryController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

router.post("/archive/:mealId", verifyJWT, archiveMeal);
router.get("/", verifyJWT, getUsageHistory);
router.put("/:id/review", verifyJWT, updateMealHistoryReview);
router.delete("/:id", verifyJWT, softDeleteUsageHistory);
router.get("/by-meal/:mealId", verifyJWT, getArchivedMealByMealId);

export default router;
