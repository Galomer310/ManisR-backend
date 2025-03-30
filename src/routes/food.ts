// backend/src/routes/food.ts
import { Router } from "express";
import {
  uploadFoodItem,
  getFoodItem,
  getAvailableFoodItems,
  getMyMeal,
  updateMyMeal,
  deleteMyMeal,
  reserveMeal,
} from "../controllers/foodController";
import { verifyJWT } from "../middlewares/authMiddleware";
import upload from "../middlewares/upload";

const router = Router();

// Use upload.fields() to accept both file and text fields.
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
router.get("/myMeal", verifyJWT, getMyMeal);
router.put("/myMeal", verifyJWT, mealUpload, updateMyMeal);
router.delete("/myMeal", verifyJWT, deleteMyMeal);
router.get("/available", getAvailableFoodItems);
router.get("/:id", getFoodItem);
router.post("/reserve/:mealId", verifyJWT, reserveMeal);

export default router;
