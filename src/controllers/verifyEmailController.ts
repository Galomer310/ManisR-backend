import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ error: "Missing token." });
    }
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || "fallbackSecret");
    } catch (err) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }
    const { userId, email } = payload;
    // Update the user's record to mark the email as verified
    await pool.promise().query("UPDATE users SET verified = ? WHERE id = ? AND email = ?", [true, userId, email]);
    // Redirect to the login page on the frontend
    return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:3000"}/login`);
  } catch (err) {
    console.error("Email verification error:", err);
    return res.status(500).json({ error: "Server error during email verification." });
  }
};
