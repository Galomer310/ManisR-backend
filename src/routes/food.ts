// backend/src/routes/food.ts
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

// Create a new meal (giver posts a meal)
// Accept both the image and the text fields
const mealUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "itemDescription", maxCount: 1 },
  { name: "pickupAddress", maxCount: 1 },
  { name: "boxOption", maxCount: 1 },
  { name: "foodTypes", maxCount: 1 },
  { name: "ingredients", maxCount: 1 },
  { name: "specialNotes", maxCount: 1 },
  { name: "userId", maxCount: 1 },
  { name: "lat", maxCount: 1 },
  { name: "lng", maxCount: 1 },
]);

router.post("/give", verifyJWT, mealUpload, uploadFoodItem);

// Giver's endpoints: retrieve, update, and delete their meal
router.get("/myMeal", verifyJWT, getMyMeal);
router.put("/myMeal", verifyJWT, updateMyMeal);
router.delete("/myMeal", verifyJWT, deleteMyMeal);

// Public endpoints: view available meals and get a specific meal by id
router.get("/available", getAvailableFoodItems);
router.get("/:id", getFoodItem);

export default router;
