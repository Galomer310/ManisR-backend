// backend/src/routes/mealConversation.ts
import { Router } from "express";
import {
  sendMealConversationMessage,
  getMealConversation,
  getMealConversationCount,
  deleteMealConversation,
} from "../controllers/mealConversationController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Send a new message
router.post("/", verifyJWT, sendMealConversationMessage);

// Retrieve conversation messages for a given meal
router.get("/:mealId", verifyJWT, getMealConversation);

// Optionally, get message count
router.get("/count/:mealId", verifyJWT, getMealConversationCount);

// Delete an entire conversation
router.delete("/:mealId", verifyJWT, deleteMealConversation);

export default router;
