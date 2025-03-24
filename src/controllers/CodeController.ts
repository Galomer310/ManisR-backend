// backend/src/controllers/CodeController.ts
import { Request, Response } from "express";
import { randomInt } from "crypto";
import redisClient from "../config/redisClient";
import pool from "../config/database";
import jwt from "jsonwebtoken";
import { UserRow } from "../types";

// Sends a 6-digit code and stores it in Redis for 5 minutes
export const sendCode = async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }
  const phoneRegex = /^05\d{8}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }
  const code = String(randomInt(100000, 1000000)); // 6-digit code
  const expirySeconds = 5 * 60; // 5 minutes

  try {
    await redisClient.set(`phoneCodes:${phone}`, code, { EX: expirySeconds });
    console.log(`Sending code ${code} to phone ${phone}`);
    return res.status(200).json({ message: "Verification code sent successfully" });
  } catch (err) {
    console.error("Redis set error:", err);
    return res.status(500).json({ error: "Server error storing code" });
  }
};

// Verifies the code and, if a user exists, returns a JWT token valid for 1 day.
export const verifyCode = async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: "Phone number and code are required" });
  }
  
  try {
    const storedCode = await redisClient.get(`phoneCodes:${phone}`);
    if (!storedCode) {
      return res.status(400).json({ error: "No code has been sent to this phone or it has expired" });
    }
    if (storedCode !== code) {
      return res.status(400).json({ error: "The code is incorrect" });
    }
    
    // Remove the code from Redis after verification
    await redisClient.del(`phoneCodes:${phone}`);
    
    // Check if a user with the provided phone exists
    const [rows] = await pool
      .promise()
      .query<UserRow[]>("SELECT id, username, phone FROM users WHERE phone = ?", [phone]);
    
    if (rows && rows.length > 0) {
      // If user exists, generate a JWT token valid for 1 day
      const user = rows[0];
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "fallbackSecret", { expiresIn: "1d" });
      return res.status(200).json({
        message: "Code verified successfully",
        token,
        user,
      });
    } else {
      // User doesn't exist – continue with the registration flow
      return res.status(200).json({ message: "Code verified successfully" });
    }
  } catch (err) {
    console.error("Error in verifyCode:", err);
    return res.status(500).json({ error: "Server error during code verification" });
  }
};
