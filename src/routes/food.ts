import { Router } from "express";
import {
  uploadFoodItem,
  getFoodItem,
  getAvailableFoodItems,
  getMyMeal,
  updateMyMeal,
  deleteMyMeal,
} from "../controllers/foodController";
import upload from "../middlewares/upload";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Create a new meal
router.post("/give", verifyJWT, upload.single("image"), uploadFoodItem);

// My meal endpoints
router.get("/myMeal", verifyJWT, getMyMeal);
router.put("/myMeal", verifyJWT, updateMyMeal);
router.delete("/myMeal", verifyJWT, deleteMyMeal);

// Public endpoints
router.get("/available", getAvailableFoodItems);
router.get("/:id", getFoodItem);

export default router;
