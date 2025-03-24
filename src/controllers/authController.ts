import { Request, Response } from "express";
import bcrypt from "bcrypt";
import pool from "../config/database";
import { UserRow } from "../types";

const saltRounds = 10;

export const registerDetails = async (req: Request, res: Response) => {
  try {
    const {
      name,
      username,
      email,
      gender,
      password,
      phone,
      honeypotField,
      captchaToken,
      formLoadedTime,
    } = req.body;

    // Honeypot check
    if (honeypotField && honeypotField.trim() !== "") {
      return res.status(200).json({ message: "Registration details saved successfully" });
    }

    // (Optional) reCAPTCHA check here if needed
    const now = Date.now();
    if (formLoadedTime && Number(formLoadedTime) && now - formLoadedTime < 3000) {
      return res.status(400).json({ error: "Form submitted too quickly" });
    }

    if (!name || !username || !email || !gender || !password || !phone) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passRegex.test(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters with letters and numbers." });
    }

    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // Check if user already exists (by phone)
    const [existingRows] = await pool
      .promise()
      .query<UserRow[]>("SELECT * FROM users WHERE phone = ?", [phone]);
    if (existingRows && existingRows.length > 0) {
      return res.status(400).json({ error: "User with this phone already exists." });
    }

    // Hash password and insert user details
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [result]: any = await pool.promise().query(
      "INSERT INTO users (name, username, email, gender, phone, password) VALUES (?, ?, ?, ?, ?, ?)",
      [name, username, email, gender, phone, hashedPassword]
    );

    const userId = result.insertId;
    console.log("User registered successfully with phone:", phone, "ID:", userId);
    // Return the new user ID so the frontend can store it
    return res.status(201).json({ message: "Registration details saved successfully", userId });
  } catch (err) {
    console.error("Registration details error:", err);
    return res.status(500).json({ error: "Server error during registration details" });
  }
};
