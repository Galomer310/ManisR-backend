import { Request, Response } from "express";
import pool from "../config/database";

export const savePreferences = async (req: Request, res: Response) => {
  try {
    const { userId, city, radius, foodPreference, allergies } = req.body;
    if (!userId || !city || !radius || !foodPreference) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    // Check if preferences already exist for the user
    const [existing] = await pool.promise().query("SELECT * FROM user_preferences WHERE user_id = ?", [userId]);
    if (Array.isArray(existing) && existing.length > 0) {
      // Update existing preferences
      await pool.promise().query(
        "UPDATE user_preferences SET city = ?, radius = ?, food_preference = ?, allergies = ? WHERE user_id = ?",
        [city, radius, foodPreference, allergies, userId]
      );
    } else {
      // Insert new preferences
      await pool.promise().query(
        "INSERT INTO user_preferences (user_id, city, radius, food_preference, allergies) VALUES (?, ?, ?, ?, ?)",
        [userId, city, radius, foodPreference, allergies]
      );
    }
    return res.status(200).json({ message: "Preferences saved successfully." });
  } catch (err) {
    console.error("Save preferences error:", err);
    return res.status(500).json({ error: "Server error saving preferences." });
  }
};

export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }
    const [rows]: any = await pool.promise().query("SELECT * FROM user_preferences WHERE user_id = ?", [userId]);
    return res.status(200).json({ preferences: rows[0] || null });
  } catch (err) {
    console.error("Get preferences error:", err);
    return res.status(500).json({ error: "Server error retrieving preferences." });
  }
};
