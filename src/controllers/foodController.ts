// backend/src/controllers/foodController.ts
import { Request, Response } from "express";
import pool from "../config/database";

/**
 * Utility function: returns field value if it's an array or a string.
 */
const getField = (field: any): string => {
  if (Array.isArray(field)) return field[0];
  return field || "";
};

/**
 * Uploads a food item.
 * Uses multer.fields() so that both file and text fields are parsed.
 */
export const uploadFoodItem = async (req: Request, res: Response) => {
  try {
    // For file field (if provided)
    const imageUrl =
      req.files && (req.files as any).image
        ? `/uploads/${(req.files as any).image[0].filename}`
        : null;

    // Extract text fields from req.body
    const itemDesc = getField(req.body.itemDescription);
    const pickupAddr = getField(req.body.pickupAddress);
    const boxOpt = getField(req.body.boxOption);
    const foodT = getField(req.body.foodTypes);
    const ingred = getField(req.body.ingredients);
    const specNotes = getField(req.body.specialNotes);
    const uId = getField(req.body.userId);
    const latStr = getField(req.body.lat);
    const lngStr = getField(req.body.lng);

    // Convert lat/lng strings to numbers (or null if empty)
    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lngStr ? parseFloat(lngStr) : null;

    const queryText = `
      INSERT INTO food_items (
        user_id, item_description, pickup_address, box_option, 
        food_types, ingredients, special_notes, avatar_url, lat, lng, 
        approved, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
    `;
    const result = await pool.query(queryText, [
      uId,
      itemDesc,
      pickupAddr,
      boxOpt,
      foodT,
      ingred,
      specNotes,
      imageUrl,
      latitude,
      longitude,
    ]);
    
    return res.status(201).json({
      message: "Meal uploaded successfully",
      mealId: result.rows[0].id,
    });
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
  const {
    itemDescription,
    pickupAddress,
    boxOption,
    foodTypes,
    ingredients,
    specialNotes,
    lat,
    lng,
  } = req.body as { [key: string]: any };

  const itemDesc = getField(itemDescription);
  const pickupAddr = getField(pickupAddress);
  const boxOpt = getField(boxOption);
  const foodT = getField(foodTypes);
  const ingred = getField(ingredients);
  const specNotes = getField(specialNotes);
  const latStr = getField(lat);
  const lngStr = getField(lng);

  const queryText = `
    UPDATE food_items
    SET item_description = $1,
        pickup_address = $2,
        box_option = $3,
        food_types = $4,
        ingredients = $5,
        special_notes = $6,
        lat = $7,
        lng = $8,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $9
  `;
  await pool.query(queryText, [
    itemDesc,
    pickupAddr,
    boxOpt,
    foodT,
    ingred,
    specNotes,
    latStr ? parseFloat(latStr) : null,
    lngStr ? parseFloat(lngStr) : null,
    userId,
  ]);
  return res.status(200).json({ message: "Meal updated successfully." });
};

/**
 * Deletes the current user's meal.
 */
export const deleteMyMeal = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const mealQuery = "SELECT id FROM food_items WHERE user_id = $1";
    const mealResult = await pool.query(mealQuery, [userId]);
    if (!mealResult.rows.length) {
      return res.status(404).json({ error: "Meal not found or already deleted." });
    }
    const mealId = mealResult.rows[0].id;
    await pool.query("DELETE FROM meal_conversation WHERE meal_id = $1", [mealId]);
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
