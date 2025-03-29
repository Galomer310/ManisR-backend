// backend/src/controllers/mealConversationController.ts
import { Request, Response } from "express";
import pool from "../config/database";

export const sendMealConversationMessage = async (req: Request, res: Response) => {
  try {
    const { mealId, senderId, receiverId, message } = req.body;
    // Check that mealId, senderId, and receiverId are not null or undefined,
    // and that message is provided.
    if (mealId == null || senderId == null || receiverId == null || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    // Insert into your actual table name "meal_converstion"
    // and set additional columns as described.
    const queryText = `
      INSERT INTO meal_converstion 
        (meal_id, sender_id, receiver_id, message, food_iteam, sender_id_user_id, receiver_id_user_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    // Here, we set food_iteam = mealId, sender_id_user_id = senderId, receiver_id_user_id = receiverId.
    const result = await pool.query(queryText, [
      mealId,
      senderId,
      receiverId,
      message,
      mealId,     // food_iteam: set to mealId (adjust as needed)
      senderId,   // sender_id_user_id
      receiverId, // receiver_id_user_id
    ]);
    return res.status(201).json({ message: "Message sent.", messageId: result.rows[0].id });
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
    // Use the correct table name "meal_converstion"
    const queryText = `
      SELECT * FROM meal_converstion
      WHERE meal_id = $1
      ORDER BY created_at ASC
    `;
    const { rows } = await pool.query(queryText, [mealId]);
    return res.status(200).json({ conversation: rows });
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
    const queryText = "SELECT COUNT(*) AS count FROM meal_converstion WHERE meal_id = $1";
    const { rows } = await pool.query(queryText, [mealId]);
    return res.status(200).json({ count: rows[0].count });
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
    const queryText = "DELETE FROM meal_converstion WHERE meal_id = $1";
    const { rowCount } = await pool.query(queryText, [mealId]);
    if (rowCount === 0) {
      return res.status(404).json({ error: "Conversation not found or already deleted." });
    }
    return res.status(200).json({ message: "Conversation deleted successfully." });
  } catch (error) {
    console.error("Delete meal conversation error:", error);
    return res.status(500).json({ error: "Server error deleting conversation." });
  }
};
