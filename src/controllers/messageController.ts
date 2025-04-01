import { Request, Response } from "express";
import pool from "../config/database";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    // Compute a unique conversation id (order independent)
    const conversationId = [senderId, receiverId].sort().join("-");
    const insertQuery = `
      INSERT INTO messages (conversation_id, sender_id, receiver_id, message, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result = await pool.query(insertQuery, [conversationId, senderId, receiverId, message]);
    return res.status(201).json({ message: "Message sent", messageId: result.rows[0].id });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Server error sending message." });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required." });
    }
    const query = `
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [conversationId]);
    return res.status(200).json({ messages: result.rows });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ error: "Server error retrieving messages." });
  }
};

export const getMyConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const query = `
      SELECT DISTINCT conversation_id FROM messages
      WHERE sender_id = $1 OR receiver_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return res.status(200).json({ conversations: result.rows });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Server error fetching conversations." });
  }
};
