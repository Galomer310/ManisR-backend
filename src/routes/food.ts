// backend/src/routes/food.ts
import { Router } from "express";
import { uploadFoodItem, getFoodItem, getAvailableFoodItems } from "../controllers/foodController";
import upload from "../middlewares/upload";

const router = Router();

// Endpoint to upload a food item (supports file upload).
router.post("/give", upload.single("image"), uploadFoodItem);
// Endpoint to get all available food items.
router.get("/available", getAvailableFoodItems);
// Endpoint to retrieve a specific food item.
router.get("/:id", getFoodItem);


export default router;
