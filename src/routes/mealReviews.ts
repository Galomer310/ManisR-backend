import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware";
import { createMealReview, getGiverMealsCount } from "../controllers/mealReviewsController";

const router = Router();

router.post("/", verifyJWT, createMealReview);

router.get("/giverCount/:userId", verifyJWT, getGiverMealsCount);

export default router;
