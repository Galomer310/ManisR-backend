// backend/src/controllers/foodController.ts
import { Request, Response } from "express";
import pool from "../config/database";
import axios from "axios";

/**
 * Uploads a food item.
 * Geocodes the pickup address and stores the food item in the database.
 */
export const uploadFoodItem = async (req: Request, res: Response) => {
  try {
    const { itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes, userId } = req.body;
    let lat: number | null = null;
    let lng: number | null = null;

    // Geocode the pickup address via Nominatim.
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickupAddress)}`;
      const { data } = await axios.get(url, { headers: { "User-Agent": "YourApp/1.0" } });
      if (Array.isArray(data) && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      }
    } catch (geoErr) {
      console.error("Geocoding error:", geoErr);
    }

    // Insert the food item using PostgreSQL parameterized query ($1, $2, ...)
    const queryText = `
      INSERT INTO food_items 
      (user_id, item_description, pickup_address, box_option, food_types, ingredients, special_notes, lat, lng, approved, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const values = [userId, itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes, lat, lng];
    const { rows } = await pool.query(queryText, values);
    const foodItemId = rows[0].id;
    return res.status(201).json({ message: "Food item uploaded successfully", foodItemId });
  } catch (err) {
    console.error("Food upload error:", err);
    return res.status(500).json({ error: "Server error during food upload." });
  }
};

/**
 * Retrieves a food item by ID.
 */
export const getFoodItem = async (req: Request, res: Response) => {
  try {
    const foodItemId = req.params.id;
    const queryText = "SELECT * FROM food_items WHERE id = $1";
    const { rows } = await pool.query(queryText, [foodItemId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Food item not found." });
    }
    return res.status(200).json({ foodItem: rows[0] });
  } catch (err) {
    console.error("Get food item error:", err);
    return res.status(500).json({ error: "Server error retrieving food item." });
  }
};

/**
 * Retrieves all available food items.
 * (Joins with the users table to include the giver's avatar.)
 */
export const getAvailableFoodItems = async (_: Request, res: Response) => {
  try {
    const queryText = `
      SELECT f.*, u.avatar_url 
      FROM food_items f 
      JOIN users u ON f.user_id = u.id 
      WHERE f.approved = true
    `;
    const { rows } = await pool.query(queryText);
    return res.status(200).json({ meals: rows });
  } catch (err) {
    console.error("Error fetching available food items:", err);
    return res.status(500).json({ error: "Server error retrieving available food items." });
  }
};

/**
 * Retrieves the current user's meal.
 */
export const getMyMeal = async (req: Request, res: Response) => {
  const userId = req.userId;
  const queryText = "SELECT * FROM food_items WHERE user_id = $1 LIMIT 1";
  const { rows } = await pool.query(queryText, [userId]);
  if (!rows || rows.length === 0) {
    return res.status(404).json({ error: "No meal found." });
  }
  return res.status(200).json({ meal: rows[0] });
};

/**
 * Updates the current user's meal.
 */
export const updateMyMeal = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes } = req.body;
  const queryText = `
    UPDATE food_items
    SET item_description = $1,
        pickup_address = $2,
        box_option = $3,
        food_types = $4,
        ingredients = $5,
        special_notes = $6,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $7
  `;
  await pool.query(queryText, [itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes, userId]);
  return res.status(200).json({ message: "Meal updated successfully." });
};

/**
 * Deletes (cancels) the current user's meal.
 * Also deletes the related meal conversation.
 */
export const deleteMyMeal = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    // Get the meal id for the user.
    const mealQuery = "SELECT id FROM food_items WHERE user_id = $1";
    const mealResult = await pool.query(mealQuery, [userId]);
    if (!mealResult.rows.length) {
      return res.status(404).json({ error: "Meal not found or already deleted." });
    }
    const mealId = mealResult.rows[0].id;
    // Delete the meal conversation
    await pool.query("DELETE FROM meal_conversation WHERE meal_id = $1", [mealId]);
    // Then delete the meal.
    const deleteQuery = "DELETE FROM food_items WHERE user_id = $1";
    const deleteResult = await pool.query(deleteQuery, [userId]);
    if (!deleteResult.rowCount) {
      return res.status(404).json({ error: "Meal not found or already deleted." });
    }
    return res.status(200).json({ message: "Meal cancelled successfully." });
  } catch (err) {
    console.error("Delete my meal error:", err);
    return res.status(500).json({ error: "Server error cancelling meal." });
  }
};
