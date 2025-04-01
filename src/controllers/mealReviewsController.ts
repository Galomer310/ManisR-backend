// backend/src/controllers/mealReviewsController.ts
import { Request, Response } from "express";
import pool from "../config/database";

export const createMealReview = async (req: Request, res: Response) => {
  try {
    const { meal_id, reviewer_id, role, user_review, general_experience, comments } = req.body;

    if (!meal_id || !reviewer_id || !role) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Ensure that optional fields are set to null if not provided.
    const reviewValue = user_review !== undefined ? user_review : null;
    const generalValue = general_experience !== undefined ? general_experience : null;
    const commentsValue = comments && comments.trim() !== "" ? comments : null;

    const result = await pool.query(
      `INSERT INTO meal_reviews 
         (meal_id, reviewer_id, reviewee_id, role, user_review, general_experience, comments, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        meal_id,
        reviewer_id,
        null, // reviewee_id not needed
        role,
        reviewValue,
        generalValue,
        commentsValue,
      ]
    );
    return res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(500).json({ error: "Server error creating review." });
  }
};
// GET /meal_reviews/giverCount/:userId
export const getGiverMealsCount = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID." });
    }
    // Query the meal_reviews table to count how many times reviewer_id = userId AND role = 'giver'
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM meal_reviews
       WHERE reviewer_id = $1
         AND role = 'giver'`,
      [userId]
    );
    const count = parseInt(result.rows[0].count, 10) || 0;
    return res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching giver meal count:", error);
    return res.status(500).json({ error: "Server error fetching giver meal count." });
  }
};