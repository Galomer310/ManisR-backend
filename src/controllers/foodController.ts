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

    // Insert the food item (assumes table 'food_items' exists).
    const [result]: any = await pool.promise().query(
      `INSERT INTO food_items
      (user_id, item_description, pickup_address, box_option, food_types, ingredients, special_notes, lat, lng, approved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes, lat, lng]
    );
    const foodItemId = result.insertId;
    return res.status(200).json({ message: "Food item uploaded successfully", foodItemId });
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
 * Retrieves all available food items.
 * Joins with the users table to include the giver's avatar.
 */
export const getAvailableFoodItems = async (req: Request, res: Response) => {
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
