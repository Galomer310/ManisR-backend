// backend/src/controllers/mealConversationController.ts
import { Request, Response } from 'express';
import pool from '../config/database';

export const sendMealConversationMessage = async (req: Request, res: Response) => {
  try {
    const { mealId, senderId, receiverId, message } = req.body;
    if (!mealId || !senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const insertQuery = `
      INSERT INTO meal_conversation (meal_id, sender_id, receiver_id, message, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
    `;
    await pool.query(insertQuery, [mealId, senderId, receiverId, message]);
    return res.status(201).json({ message: "Message sent." });
  } catch (error) {
    console.error("Send meal conversation message error:", error);
    return res.status(500).json({ error: "Server error sending message." });
  }
};

export const getMealConversation = async (req: Request, res: Response) => {
  try {
    const mealId = req.params.mealId;
    if (!mealId) {
      return res.status(400).json({ error: "Meal ID is required." });
    }
    const query = `
      SELECT * FROM meal_conversation
      WHERE meal_id = $1
      ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [mealId]);
    return res.status(200).json({ conversation: result.rows });
  } catch (error) {
    console.error("Get meal conversation error:", error);
    return res.status(500).json({ error: "Server error retrieving conversation." });
  }
};

export const getMealConversationCount = async (req: Request, res: Response) => {
  try {
    const mealId = req.params.mealId;
    if (!mealId) {
      return res.status(400).json({ error: "Meal ID is required." });
    }
    const query = "SELECT COUNT(*) AS count FROM meal_conversation WHERE meal_id = $1";
    const result = await pool.query(query, [mealId]);
    return res.status(200).json({ count: parseInt(result.rows[0].count, 10) });
  } catch (error) {
    console.error("Get conversation count error:", error);
    return res.status(500).json({ error: "Server error retrieving conversation count." });
  }
};

export const deleteMealConversation = async (req: Request, res: Response) => {
  try {
    const mealId = req.params.mealId;
    if (!mealId) {
      return res.status(400).json({ error: "Meal ID is required." });
    }
    const deleteQuery = "DELETE FROM meal_conversation WHERE meal_id = $1";
    const result = await pool.query(deleteQuery, [mealId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Conversation not found or already deleted." });
    }
    return res.status(200).json({ message: "Conversation deleted successfully." });
  } catch (error) {
    console.error("Delete meal conversation error:", error);
    return res.status(500).json({ error: "Server error deleting conversation." });
  }
};
