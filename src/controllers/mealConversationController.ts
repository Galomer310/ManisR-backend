// backend/src/controllers/mealConversationController.ts
import { Request, Response } from "express";
import pool from "../config/database";

export const sendMealConversationMessage = async (req: Request, res: Response) => {
  try {
    // Parse IDs to numbers
    const mealId = parseInt(req.body.mealId, 10);
    const senderId = parseInt(req.body.senderId, 10);
    const receiverId = parseInt(req.body.receiverId, 10);
    const { message } = req.body;
    
    if (isNaN(mealId) || isNaN(senderId) || isNaN(receiverId) || !message) {
      return res.status(400).json({ error: "All fields are required and must be valid." });
    }
    
    const queryText = `
      INSERT INTO meal_conversation 
        (meal_id, sender_id, receiver_id, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const result = await pool.query(queryText, [mealId, senderId, receiverId, message]);
    return res.status(201).json({ message: "Message sent.", messageId: result.rows[0].id });
  } catch (error) {
    console.error("Send meal conversation message error:", error);
    return res.status(500).json({ error: "Server error sending message." });
  }
};

export const getMealConversation = async (req: Request, res: Response) => {
  try {
    // Parse the mealId from the URL (it comes as a string)
    const mealId = parseInt(req.params.mealId, 10);
    if (isNaN(mealId)) {
      return res.status(400).json({ error: "Invalid Meal ID." });
    }
    const queryText = `
      SELECT * FROM meal_conversation
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
    const mealId = parseInt(req.params.mealId, 10);
    if (isNaN(mealId)) {
      return res.status(400).json({ error: "Invalid Meal ID." });
    }
    const queryText = "SELECT COUNT(*) AS count FROM meal_conversation WHERE meal_id = $1";
    const { rows } = await pool.query(queryText, [mealId]);
    return res.status(200).json({ count: rows[0].count });
  } catch (error) {
    console.error("Get conversation count error:", error);
    return res.status(500).json({ error: "Server error retrieving conversation count." });
  }
};

export const deleteMealConversation = async (req: Request, res: Response) => {
  try {
    const mealId = parseInt(req.params.mealId, 10);
    if (isNaN(mealId)) {
      return res.status(400).json({ error: "Invalid Meal ID." });
    }
    const queryText = "DELETE FROM meal_conversation WHERE meal_id = $1";
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
