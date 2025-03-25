// backend/src/routes/food.ts
import { Router } from "express";
import { uploadFoodItem, getFoodItem, getAvailableFoodItems } from "../controllers/foodController";
import upload from "../middlewares/upload";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Protected endpoint to upload a food item (requires authentication).
router.post("/give", verifyJWT, upload.single("image"), uploadFoodItem);

// This endpoint is public so anyone can view available food items.
router.get("/available", getAvailableFoodItems);

// Protected endpoint to retrieve a specific food item by id.
router.get("/:id", verifyJWT, getFoodItem);

export default router;
