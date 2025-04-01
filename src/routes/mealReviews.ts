// backend/src/routes/mealReviews.ts
import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware";
import { createMealReview, getGiverMealsCount } from "../controllers/mealReviewsController";

const router = Router();

// Existing route
router.post("/", verifyJWT, createMealReview);

// New route
router.get("/giverCount/:userId", verifyJWT, getGiverMealsCount);

export default router;
