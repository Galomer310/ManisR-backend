import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../config/database";
import { UserRow } from "../types";

const saltRounds = 10;

/**
 * Registers user details using email.
 */
export const registerDetails = async (req: Request, res: Response) => {
  try {
    const { name, username, email, gender, password, honeypotField, captchaToken, formLoadedTime } = req.body;

    if (honeypotField && honeypotField.trim() !== "") {
      return res.status(200).json({ message: "Registration details saved successfully" });
    }

    const now = Date.now();
    if (formLoadedTime && Number(formLoadedTime) && now - formLoadedTime < 3000) {
      return res.status(400).json({ error: "Form submitted too quickly" });
    }

    if (!name || !username || !email || !gender || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passRegex.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters with letters and numbers." });
    }

    // Check if a user with the provided email already exists.
    const [existingRows] = await pool.promise().query<UserRow[]>("SELECT * FROM users WHERE email = ?", [email]);
    if (existingRows && existingRows.length > 0) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result]: any = await pool.promise().query(
      "INSERT INTO users (name, username, email, gender, password) VALUES (?, ?, ?, ?, ?)",
      [name, username, email, gender, hashedPassword]
    );

    const userId = result.insertId;
    console.log("User registered successfully with email:", email, "ID:", userId);
    return res.status(201).json({ message: "Registration details saved successfully", userId });
  } catch (err) {
    console.error("Registration details error:", err);
    return res.status(500).json({ error: "Server error during registration details" });
  }
};
