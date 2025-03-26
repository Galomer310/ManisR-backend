// backend/src/controllers/mealConversationController.ts
import { Request, Response } from "express";
import pool from "../config/database";

/**
 * Inserts a new message into the meal_conversation table.
 * Expects: mealId, senderId, receiverId, and message.
 */
export const sendMealConversationMessage = async (req: Request, res: Response) => {
  try {
    const { mealId, senderId, receiverId, message } = req.body;
    if (!mealId || !senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    await pool
      .query(
        "INSERT INTO meal_conversation (meal_id, sender_id, receiver_id, message, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)",
        [mealId, senderId, receiverId, message]
      );
    return res.status(201).json({ message: "Message sent." });
  } catch (error) {
    console.error("Send meal conversation message error:", error);
    return res.status(500).json({ error: "Server error sending message." });
  }
};

/**
 * Retrieves all messages for a given meal conversation.
 * Expects the mealId as a URL parameter.
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
  } catch (error) {
    console.error("Get meal conversation error:", error);
    return res.status(500).json({ error: "Server error retrieving conversation." });
  }
};

/**
 * Retrieves the count of messages for a given meal conversation.
 * Instead of returning a 404 when no messages exist, it returns count 0.
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
    // If no rows are returned, count is 0
    const count = result.rows.length ? parseInt(result.rows[0].count, 10) : 0;
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Get conversation count error:", error);
    return res.status(500).json({ error: "Server error retrieving conversation count." });
  }
};

/**
 * Deletes all messages for a given meal conversation.
 * This should be called when the giver cancels the meal.
 */
export const deleteMealConversation = async (req: Request, res: Response) => {
  try {
    const mealId = req.params.mealId;
    if (!mealId) {
      return res.status(400).json({ error: "Meal ID is required." });
    }
    const result = await pool.query("DELETE FROM meal_conversation WHERE meal_id = $1", [mealId]);
    // Even if no messages were found, return success with count 0.
    return res.status(200).json({ message: "Conversation deleted successfully.", deleted: result.rowCount });
  } catch (error) {
    console.error("Delete meal conversation error:", error);
    return res.status(500).json({ error: "Server error deleting conversation." });
  }
};
