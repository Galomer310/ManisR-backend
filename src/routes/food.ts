import { Router } from "express";
import axios from "axios"; // for HTTP requests to Nominatim
import upload from "../middlewares/upload";
import pool from "../config/database";

const router = Router();

/**
 * POST /food/give
 *  - Geocodes the pickupAddress via Nominatim.
 *  - Stores lat/lng in 'food_items'.
 *  - Returns foodItemId on success.
 */
router.post("/give", upload.single("image"), async (req, res) => {
  try {
    const {
      itemDescription,
      pickupAddress,
      boxOption,
      foodTypes,
      ingredients,
      specialNotes,
      userId,
    } = req.body;

    // (1) Geocode the pickupAddress via Nominatim
    let lat: number | null = null;
    let lng: number | null = null;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        pickupAddress
      )}`;
      const { data } = await axios.get(url, {
        headers: { "User-Agent": "MansiR-app/1.0" },
      });
      if (Array.isArray(data) && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      }
    } catch (geoErr) {
      console.error("Geocoding error:", geoErr);
    }

    // (2) Insert row into food_items
    const imageUrl = req.file ? req.file.path : null;
    const [result]: any = await pool.promise().query(
      `INSERT INTO food_items
       (user_id, item_description, pickup_address, box_option, food_types, ingredients, special_notes, image_url, lat, lng, approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, itemDescription, pickupAddress, boxOption, foodTypes, ingredients, specialNotes, imageUrl, lat, lng]
    );

    const foodItemId = result.insertId;
    return res.status(200).json({
      message: "Food item uploaded successfully",
      foodItemId,
    });
  } catch (err) {
    console.error("Food upload error:", err);
    return res.status(500).json({ error: "Server error during food upload" });
  }
});

/**
 * GET /food/:id
 * Retrieves a food item by its ID.
 */
router.get("/:id", async (req, res) => {
  try {
    const foodItemId = req.params.id;
    const [rows]: any = await pool
      .promise()
      .query("SELECT * FROM food_items WHERE id = ?", [foodItemId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Food item not found" });
    }
    return res.status(200).json({ foodItem: rows[0] });
  } catch (err) {
    console.error("Get food item error:", err);
    return res.status(500).json({ error: "Server error retrieving food item" });
  }
});

/**
 * DELETE /food/:foodItemId
 * Cancels (deletes) the meal row by ID.
 */
router.delete("/:foodItemId", async (req, res) => {
  try {
    const { foodItemId } = req.params;
    const [result]: any = await pool
      .promise()
      .query("DELETE FROM food_items WHERE id = ?", [foodItemId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Meal not found or already deleted" });
    }
    return res.status(200).json({ message: "Meal canceled successfully" });
  } catch (err) {
    console.error("Cancel meal error:", err);
    return res.status(500).json({ error: "Server error canceling meal" });
  }
});

/**
 * GET /food/available
 * Retrieves all available meal cards.
 */
router.get("/available", async (req, res) => {
  try {
    const [rows]: any = await pool.promise().query(
      "SELECT f.*, u.avatar_url FROM food_items f JOIN users u ON f.user_id = u.id WHERE f.approved = 1"
    );
    return res.status(200).json({ meals: rows });
  } catch (err) {
    console.error("Error fetching available meals:", err);
    return res.status(500).json({ error: "Server error retrieving available meals" });
  }
});


export default router;
