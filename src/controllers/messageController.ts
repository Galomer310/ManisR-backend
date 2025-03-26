import { Request, Response } from "express";
import pool from "../config/database";

/**
 * Sends a message from one user to another.
 * The conversation ID is computed by sorting the two user IDs.
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, message } = req.body;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const conversationId = [senderId, receiverId].sort().join("-");
    await pool.promise().query(
      "INSERT INTO messages (conversation_id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)",
      [conversationId, senderId, receiverId, message]
    );
    return res.status(201).json({ message: "Message sent." });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Server error sending message." });
  }
};

/**
 * Retrieves all messages for a given conversation.
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is required." });
    }
    const [rows]: any = await pool.promise().query(
      "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
      [conversationId]
    );
    return res.status(200).json({ messages: rows });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ error: "Server error retrieving messages." });
  }
};

/**
 * Retrieves all conversations for the current user.
 */
export const getMyConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const [rows]: any = await pool.promise().query(
      "SELECT DISTINCT conversation_id FROM messages WHERE sender_id = ? OR receiver_id = ?",
      [userId, userId]
    );
    return res.status(200).json({ conversations: rows });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return res.status(500).json({ error: "Server error fetching conversations." });
  }
};
