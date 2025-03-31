// backend/src/controllers/authController.ts
import { Request, Response } from "express";
import pool from "../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../config/email";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const saltRounds = 10;

/**
 * Registers a new user.
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }
    // Check if the user already exists.
    const { rowCount } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rowCount && rowCount > 0) {
      return res.status(400).json({ error: "User with this email already exists." });
    }
    // Hash the password.
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Insert the new user.
    const result = await pool.query(
      "INSERT INTO users (name, username, email, password, verified, avatar_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id",
      [name, username, email, hashedPassword, false, process.env.DEFAULT_AVATAR || "default_logo.png"]
    );
    const userId = result.rows[0].id;
    // Generate a token for email verification.
    const token = jwt.sign({ userId, email }, process.env.JWT_SECRET || "fallbackSecret", { expiresIn: "1d" });
    // Send verification email using EmailJS.
    await sendVerificationEmail(email, token);
    return res.status(201).json({ message: "Registration successful. Please verify your email." });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ error: "Server error during registration." });
  }
};

/**
 * Logs in a verified user.
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (!result.rows.length) {
      return res.status(400).json({ error: "User not found." });
    }
    const user = result.rows[0];
    if (!user.verified) {
      return res.status(400).json({ error: "Email not verified. Please verify your email." });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect password." });
    }
    // Generate JWT for session authentication.
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "fallbackSecret", { expiresIn: "1d" });
    return res.status(200).json({ message: "Login successful.", token, user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
};
