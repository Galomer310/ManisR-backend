// backend/src/controllers/mealHistoryController.ts
import { Request, Response } from "express";
import pool from "../config/database";
import { io } from "../app";

// Archive a meal: move its data from food_items to meal_history.
export const archiveMeal = async (req: Request, res: Response) => {
  try {
    const mealId = parseInt(req.params.mealId, 10);
    if (isNaN(mealId)) {
      return res.status(400).json({ error: "Invalid meal ID" });
    }
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    // Get the meal details from food_items.
    const mealResult = await pool.query("SELECT * FROM food_items WHERE id = $1", [mealId]);
    if (mealResult.rowCount === 0) {
      return res.status(404).json({ error: "Meal not found" });
    }
    const meal = mealResult.rows[0];
    
    // Insert meal details into meal_history.
    const insertQuery = `
      INSERT INTO meal_history (
        meal_id, giver_id, taker_id, item_description, pickup_address, meal_image, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const giverId = meal.user_id;
    const takerId = meal.taker_id;
    const result = await pool.query(insertQuery, [
      mealId,
      giverId,
      takerId,
      meal.item_description,
      meal.pickup_address,
      meal.avatar_url // assuming the meal image is stored in this column
    ]);
    
    // Delete the meal conversation (if exists) and the meal itself.
    await pool.query("DELETE FROM meal_conversation WHERE meal_id = $1", [mealId]);
    await pool.query("DELETE FROM food_items WHERE id = $1", [mealId]);
    
    // Optionally, notify via socket.io.
    io.emit("mealArchived", { mealId, historyId: result.rows[0].id });
    
    return res.status(200).json({ message: "Meal archived successfully." });
  } catch (err) {
    console.error("Error archiving meal:", err);
    return res.status(500).json({ error: "Server error archiving meal." });
  }
};
// Get usage history for the current user.
export const getUsageHistory = async (req: Request, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      const query = `
        SELECT * FROM meal_history 
        WHERE giver_id = $1 OR taker_id = $1
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [userId]);
      return res.status(200).json({ history: result.rows });
    } catch (err) {
      console.error("Error fetching usage history:", err);
      return res.status(500).json({ error: "Server error fetching usage history." });
    }
};
  // Delete a specific usage history record.
  export const deleteUsageHistory = async (req: Request, res: Response) => {
    try {
      const historyId = parseInt(req.params.id, 10);
      if (isNaN(historyId)) {
        return res.status(400).json({ error: "Invalid history ID" });
      }
      const userId = req.userId;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      
      // Check if the record belongs to the user.
      const check = await pool.query("SELECT * FROM meal_history WHERE id = $1", [historyId]);
      if (check.rowCount === 0) {
        return res.status(404).json({ error: "History record not found" });
      }
      const record = check.rows[0];
      if (record.giver_id !== userId && record.taker_id !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this record" });
      }
      
      await pool.query("DELETE FROM meal_history WHERE id = $1", [historyId]);
      return res.status(200).json({ message: "History record deleted successfully." });
    } catch (err) {
      console.error("Error deleting history record:", err);
      return res.status(500).json({ error: "Server error deleting history record." });
    }
};
  