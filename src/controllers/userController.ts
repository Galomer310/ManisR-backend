import { Request, Response } from "express";
import pool from "../config/database";


export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const query = "SELECT name, username, avatar_url FROM users WHERE id = $1";
    const { rows } = await pool.query(query, [userId]);
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// PUT /users/avatar
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!req.file)
      return res.status(400).json({ error: "No file uploaded" });
    const backendBase = process.env.BACKEND_BASE_URL || "https://manisr-backend.onrender.com";
    const avatarUrl = `${backendBase}/uploads/${req.file.filename}`;
    
    const query =
      "UPDATE users SET avatar_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING avatar_url";
    const { rows } = await pool.query(query, [avatarUrl, userId]);
    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ avatarUrl: rows[0].avatar_url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error updating avatar" });
  }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // from verifyJWT middleware
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Delete user from database. 
    await pool.query("DELETE FROM users WHERE id = $1", [userId]);

    return res.status(200).json({ message: "Account deleted successfully." });
  } catch (err) {
    console.error("Error deleting user account:", err);
    return res.status(500).json({ error: "Server error deleting account." });
  }
};