// backend/src/controllers/preferencesController.ts
import { Request, Response } from 'express';
import pool from '../config/database';

/**
 * Saves or updates user preferences.
 * Expects: userId, city, radius, foodPreference, allergies.
 */
export const savePreferences = async (req: Request, res: Response) => {
  try {
    const { userId, city, radius, foodPreference, allergies } = req.body;
    if (!userId || !city || !radius || !foodPreference) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    // Execute query to check if preferences already exist.
    const result = await pool.query("SELECT * FROM user_preferences WHERE user_id = $1", [userId]);

    // Use optional chaining and a default value to ensure rowCount is a number.
    if ((result?.rowCount ?? 0) > 0) {
      // Update existing preferences.
      await pool.query(
        "UPDATE user_preferences SET city = $1, radius = $2, food_preference = $3, allergies = $4, updated_at = CURRENT_TIMESTAMP WHERE user_id = $5",
        [city, radius, foodPreference, allergies, userId]
      );
    } else {
      // Insert new preferences.
      await pool.query(
        "INSERT INTO user_preferences (user_id, city, radius, food_preference, allergies, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [userId, city, radius, foodPreference, allergies]
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
    const query = "SELECT * FROM user_preferences WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
    return res.status(200).json({ preferences: (result?.rowCount ?? 0) > 0 ? result.rows[0] : null });
  } catch (err) {
    console.error("Get preferences error:", err);
    return res.status(500).json({ error: "Server error retrieving preferences." });
  }
};
