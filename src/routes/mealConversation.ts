import { Router } from "express";
import { 
  sendMealConversationMessage, 
  getMealConversation, 
  getMealConversationCount, 
  deleteMealConversation 
} from "../controllers/mealConversationController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// Create a new message for a meal conversation
router.post("/", verifyJWT, sendMealConversationMessage);

// Get all messages for a specific meal conversation by mealId
router.get("/:mealId", verifyJWT, getMealConversation);

// Get the count of messages for a meal conversation (for badge notifications)
router.get("/count/:mealId", verifyJWT, getMealConversationCount);

// Delete the conversation for a meal (used when a meal is cancelled)
router.delete("/:mealId", verifyJWT, deleteMealConversation);

export default router;
