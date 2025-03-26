// backend/src/controllers/mealConversationController.ts
import { Request, Response } from "express";
import pool from "../config/database";

/**
 * Inserts a new message into the meal_conversation table.
 */
export const sendMealConversationMessage = async (req: Request, res: Response) => {
  try {
    const { mealId, senderId, receiverId, message } = req.body;
    if (!mealId || !senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    await pool.query(
      "INSERT INTO meal_conversation (meal_id, sender_id, receiver_id, message, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)",
      [mealId, senderId, receiverId, message]
    );
    return res.status(201).json({ message: "Message sent." });
  } catch (err) {
    console.error("Send meal conversation message error:", err);
    return res.status(500).json({ error: "Server error sending message." });
  }
};

/**
 * Retrieves all messages for a given meal conversation.
 */
export const getMealConversation = async (req: Request, res: Response) => {
  try {
    const mealId = req.params.mealId;
    if (!mealId) {
      return res.status(400).json({ error: "Meal ID is required." });
    }
    const result = await pool.query(
      "SELECT * FROM meal_conversation WHERE meal_id = $1 ORDER BY created_at ASC",
      [mealId]
    );
    return res.status(200).json({ conversation: result.rows });
  } catch (err) {
    console.error("Get meal conversation error:", err);
    return res.status(500).json({ error: "Server error retrieving conversation." });
  }
};

/**
 * Retrieves the count of messages for a given meal conversation.
 */
export const getMealConversationCount = async (req: Request, res: Response) => {
  try {
    const mealId = req.params.mealId;
    if (!mealId) {
      return res.status(400).json({ error: "Meal ID is required." });
    }
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM meal_conversation WHERE meal_id = $1",
      [mealId]
    );
    return res.status(200).json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error("Get conversation count error:", err);
    return res.status(500).json({ error: "Server error retrieving conversation count." });
  }
};

/**
 * Deletes all messages for a given meal conversation.
 */
export const deleteMealConversation = async (req: Request, res: Response) => {
  try {
    const mealId = req.params.mealId;
    if (!mealId) {
      return res.status(400).json({ error: "Meal ID is required." });
    }
    const result = await pool.query("DELETE FROM meal_conversation WHERE meal_id = $1", [mealId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Conversation not found or already deleted." });
    }
    return res.status(200).json({ message: "Conversation deleted successfully." });
  } catch (err) {
    console.error("Delete meal conversation error:", err);
    return res.status(500).json({ error: "Server error deleting conversation." });
  }
};
