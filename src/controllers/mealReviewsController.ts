// backend/src/controllers/mealReviewsController.ts
import { Request, Response } from "express";
import pool from "../config/database";

/**
 * Creates a new meal review.
 * Expects in the request body:
 *   - meal_id (number)
 *   - reviewer_id (number)
 *   - reviewee_id (number, optional)
 *   - role (string, 'taker' or 'giver')
 *   - user_review (integer, optional)
 *   - general_experience (integer, optional)
 *   - comments (text, optional)
 */
export const createMealReview = async (req: Request, res: Response) => {
  try {
    const {
      meal_id,
      reviewer_id,
      reviewee_id,
      role,
      user_review,
      general_experience,
      comments,
    } = req.body;

    if (!meal_id || !reviewer_id || !role) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const result = await pool.query(
      `INSERT INTO meal_reviews 
         (meal_id, reviewer_id, reviewee_id, role, user_review, general_experience, comments, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        meal_id,
        reviewer_id,
        reviewee_id || null,
        role,
        user_review || null,
        general_experience || null,
        comments || null,
      ]
    );

    return res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    console.error("Error creating review:", err);
    return res.status(500).json({ error: "Server error creating review." });
  }
};
