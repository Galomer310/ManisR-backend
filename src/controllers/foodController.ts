// backend/src/controllers/foodController.ts
import { Request, Response } from "express";
import pool from "../config/database";
import axios from "axios";

/**
 * Uploads a food item.
 * Geocodes the pickup address via Nominatim and stores the item in the database.
 */
export const uploadFoodItem = async (req: Request, res: Response) => {
  try {
    const { itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes, userId } = req.body;
    let lat: number | null = null;
    let lng: number | null = null;

    // Geocode the pickup address using Nominatim.
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

    const [result]: any = await pool.promise().query(
      `INSERT INTO food_items
      (user_id, item_description, pickup_address, box_option, food_types, ingredients, special_notes, lat, lng, approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes, lat, lng]
    );
    const foodItemId = result.insertId;
    return res.status(201).json({ message: "Food item uploaded successfully", foodItemId });
  } catch (err) {
    console.error("Food upload error:", err);
    return res.status(500).json({ error: "Server error during food upload." });
  }
};

/**
 * Retrieves a food item by its ID.
 */
export const getFoodItem = async (req: Request, res: Response) => {
  try {
    const foodItemId = req.params.id;
    const [rows]: any = await pool.promise().query("SELECT * FROM food_items WHERE id = ?", [foodItemId]);
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
 * Retrieves all available food items (approved) joined with the giver's avatar.
 */
export const getAvailableFoodItems = async (_: Request, res: Response) => {
  try {
    const [rows]: any = await pool.promise().query(
      `SELECT f.*, u.avatar_url FROM food_items f 
       JOIN users u ON f.user_id = u.id 
       WHERE f.approved = 1`
    );
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
  try {
    const userId = req.userId;
    const [rows]: any = await pool.promise().query("SELECT * FROM food_items WHERE user_id = ? LIMIT 1", [userId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No meal found for this user." });
    }
    return res.status(200).json({ meal: rows[0] });
  } catch (err) {
    console.error("Get my meal error:", err);
    return res.status(500).json({ error: "Server error retrieving meal." });
  }
};

/**
 * Updates the current user's meal.
 */
export const updateMyMeal = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes } = req.body;
    await pool.promise().query(
      "UPDATE food_items SET item_description = ?, pickup_address = ?, box_option = ?, food_types = ?, ingredients = ?, special_notes = ? WHERE user_id = ?",
      [itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes, userId]
    );
    return res.status(200).json({ message: "Meal updated successfully." });
  } catch (err) {
    console.error("Update my meal error:", err);
    return res.status(500).json({ error: "Server error updating meal." });
  }
};

/**
 * Deletes (cancels) the current user's meal.
 */
export const deleteMyMeal = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const [result]: any = await pool.promise().query("DELETE FROM food_items WHERE user_id = ?", [userId]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: "Meal not found or already deleted." });
    }
    return res.status(200).json({ message: "Meal cancelled successfully." });
  } catch (err) {
    console.error("Delete my meal error:", err);
    return res.status(500).json({ error: "Server error cancelling meal." });
  }
};
