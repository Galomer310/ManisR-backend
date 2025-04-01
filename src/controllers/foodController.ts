import { Request, Response } from "express";
import pool from "../config/database";
import { io } from "../app"; 
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
export const getAvailableFoodItems = async (_req: Request, res: Response) => {
  try {
    const queryText = `
      SELECT 
        f.id,
        f.user_id,
        f.item_description,
        f.pickup_address,
        f.box_option,
        f.food_types,
        f.ingredients,
        f.special_notes,
        f.lat,
        f.lng,
        f.avatar_url AS meal_avatar,  
        u.avatar_url AS user_avatar   
      FROM food_items f
      JOIN users u ON f.user_id = u.id
      WHERE f.approved = true
        AND f.status = 'available'
    `;
    const { rows } = await pool.query(queryText);
    return res.status(200).json({ meals: rows });
  } catch (err) {
    console.error("Error fetching available food items:", err);
    return res.status(500).json({ error: "Server error retrieving meals." });
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
/**
 * Reserves a meal for the currently logged-in Taker (req.userId).
 */
export const reserveMeal = async (req: Request, res: Response) => {
  try {
    const mealId = parseInt(req.params.mealId, 10);
    const takerId = req.userId;

    // 1) Mark the meal as reserved in DB
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 60 * 1000);
    const updateQuery = `
      UPDATE food_items
      SET status = 'reserved',
          taker_id = $2,
          reserved_at = $3,
          expires_at = $4
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [mealId, takerId, now, expires]);
    const reservedMeal = result.rows[0];

    // 2) Emit an event: include the entire meal row (so Giver sees item_description, etc.)
    io.emit("mealReserved", {
      meal: reservedMeal,
      reservedAt: reservedMeal.reserved_at,
      expiresAt: reservedMeal.expires_at,
    });

    // 3) Return success to the Taker
    return res.status(200).json({
      message: "Meal reserved successfully.",
      meal: reservedMeal,
    });
  } catch (err) {
    console.error("Error reserving meal:", err);
    return res.status(500).json({ error: "Server error reserving meal." });
  }
};
/**
 * Taker finalizes collection of the meal: deletes the meal row & conversation.
 */
export const collectMeal = async (req: Request, res: Response) => {
  try {
    const mealId = parseInt(req.params.mealId, 10);
    if (isNaN(mealId)) {
      return res.status(400).json({ error: "Invalid meal ID" });
    }
    const takerId = req.userId;
    if (!takerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 1) Verify this meal is currently reserved by the same taker
    const checkQuery = `
      SELECT id, user_id, taker_id, status
      FROM food_items
      WHERE id = $1
    `;
    const checkResult = await pool.query(checkQuery, [mealId]);
    if (checkResult.rowCount === 0) {
      return res.status(404).json({ error: "Meal not found." });
    }
    const mealRow = checkResult.rows[0];
    const userId = req.userId;
    const isTaker = mealRow.taker_id === userId;
    const isGiver = mealRow.user_id === userId;
    
    if (!isTaker && !isGiver) {
      return res.status(403).json({ error: "You are not authorized to collect this meal." });
    }
    

    // 2) Delete conversation for this meal
    await pool.query("DELETE FROM meal_conversation WHERE meal_id = $1", [mealId]);

    // 3) Delete the meal row
    await pool.query("DELETE FROM food_items WHERE id = $1", [mealId]);

    // 4) Emit a 'mealCollected' socket event so the Giver can respond
    //    We'll send the Giver's ID & Taker's ID, so the Giver can see "my meal was collected"
    io.emit("mealCollected", {
      mealId: mealId,
      giverId: mealRow.user_id,
      takerId: mealRow.taker_id,
    });

    return res.status(200).json({
      message: "Meal collected and removed from the database.",
    });
  } catch (err) {
    console.error("Collect meal error:", err);
    return res.status(500).json({ error: "Server error collecting meal." });
  }
};

export const updateMealStatus = async (req: Request, res: Response) => {
  try {
    const mealId = parseInt(req.params.mealId, 10);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status is required." });
    }
    const result = await pool.query(
      "UPDATE food_items SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, mealId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Meal not found." });
    }
    return res.status(200).json({ meal: result.rows[0] });
  } catch (err) {
    console.error("Error updating meal status:", err);
    return res.status(500).json({ error: "Server error updating meal status." });
  }
};