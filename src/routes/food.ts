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
router.post("/give", verifyJWT, upload.single("image"), uploadFoodItem);

// Giver's endpoints: retrieve, update, and delete their meal
router.get("/myMeal", verifyJWT, getMyMeal);
router.put("/myMeal", verifyJWT, updateMyMeal);
router.delete("/myMeal", verifyJWT, deleteMyMeal);

// Public endpoints: view available meals and get a specific meal by id
router.get("/available", getAvailableFoodItems);
router.get("/:id", getFoodItem);

export default router;
