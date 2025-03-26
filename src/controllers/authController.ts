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
    // Check if user already exists.
    const [existingRows] = await pool.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return res.status(400).json({ error: "User with this email already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result]: any = await pool.promise().query(
      "INSERT INTO users (name, username, email, password, verified, avatar_url) VALUES (?, ?, ?, ?, ?, ?)",
      [name, username, email, hashedPassword, false, process.env.DEFAULT_AVATAR || "default_logo.png"]
    );
    const userId = result.insertId;
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1d" }
    );
    await sendVerificationEmail(email, token);
    return res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
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
    const [rows]: any = await pool.promise().query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "User not found." });
    }
    const user = rows[0];
    if (!user.verified) {
      return res.status(400).json({ error: "Email not verified. Please verify your email." });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect password." });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "1d" }
    );
    return res.status(200).json({ message: "Login successful.", token, user });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during login." });
  }
};
