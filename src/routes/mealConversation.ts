import { Router } from "express";
import { 
  sendMealConversationMessage, 
  getMealConversation, 
  getMealConversationCount, 
  deleteMealConversation 
} from "../controllers/mealConversationController";
import { verifyJWT } from "../middlewares/authMiddleware";

const router = Router();

// POST a new message for a meal conversation.
router.post("/", verifyJWT, sendMealConversationMessage);

// GET all messages for a specific meal conversation.
router.get("/:mealId", verifyJWT, getMealConversation);

// GET message count (for the badge counter) for a meal conversation.
router.get("/count/:mealId", verifyJWT, getMealConversationCount);

// DELETE conversation messages when a meal is cancelled.
router.delete("/:mealId", verifyJWT, deleteMealConversation);

export default router;
