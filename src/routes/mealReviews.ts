// backend/src/routes/mealReviews.ts
import { Router } from "express";
import { createMealReview } from "../controllers/mealReviewsController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Create a new meal review (protected)
router.post("/", verifyJWT, createMealReview);

export default router;
