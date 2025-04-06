import { Request, Response } from "express";
import pool from "../config/database";
/**
 * Saves or updates user preferences.
 */
export const savePreferences = async (req: Request, res: Response) => {
  try {
    // Extract phone along with other fields
    const { userId, phone, city, radius, foodPreference, allergies } = req.body;
    
    // Validate required fields 
    if (!userId || !phone || !city || !radius || !foodPreference) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    
    // Check if preferences already exist for this user
    const existing = await pool.query(
      "SELECT * FROM user_preferences WHERE user_id = $1", 
      [userId]
    );
    
    if (existing.rowCount && existing.rowCount > 0) {
      // Update existing preferences, including the phone number.
      await pool.query(
        "UPDATE user_preferences SET phone = $1, city = $2, radius = $3, food_preference = $4, allergies = $5, updated_at = CURRENT_TIMESTAMP WHERE user_id = $6",
        [phone, city, radius, foodPreference, allergies, userId]
      );
    } else {
      await pool.query(
        "INSERT INTO user_preferences (user_id, phone, city, radius, food_preference, allergies, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [userId, phone, city, radius, foodPreference, allergies]
      );
    }
    return res.status(200).json({ message: "Preferences saved successfully." });
  } catch (err) {
    console.error("Save preferences error:", err);
    return res.status(500).json({ error: "Server error saving preferences." });
  }
};
/**
 * Retrieves preferences for a given user.
 */
export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }
    const result = await pool.query(
      "SELECT * FROM user_preferences WHERE user_id = $1",
      [userId]
    );
    return res.status(200).json({ preferences: result.rows[0] || null });
  } catch (err) {
    console.error("Get preferences error:", err);
    return res.status(500).json({ error: "Server error retrieving preferences." });
  }
};
/**
 * Updates user preferences.
 */
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const { phone, city, radius, foodPreference, allergies } = req.body;
    const { userId } = req.params;

    if (!userId || !phone || !city || !radius || !foodPreference) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    await pool.query(
      "UPDATE user_preferences SET phone = $1, city = $2, radius = $3, food_preference = $4, allergies = $5, updated_at = CURRENT_TIMESTAMP WHERE user_id = $6",
      [phone, city, radius, foodPreference, allergies, userId]
    );

    return res.status(200).json({ message: "Preferences updated successfully." });
  } catch (err) {
    console.error("Update preferences error:", err);
    return res.status(500).json({ error: "Server error updating preferences." });
  }
};