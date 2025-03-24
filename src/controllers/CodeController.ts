// backend/src/controllers/CodeController.ts

import { Request, Response } from "express";
import { randomInt } from "crypto";
import redisClient from "../config/redisClient";

/**
 * Sends a simulated verification code to the provided phone number.
 * Generates a 6-digit code, stores it in Redis (or dummy Redis), logs it, and returns it in the response.
 */
export const sendCode = async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Generate a 6-digit code
    const code = String(randomInt(100000, 1000000));
    const expirySeconds = 300; // 5 minutes

    // Store the code in Redis
    await redisClient.set(`phoneCodes:${phone}`, code, { EX: expirySeconds });
    console.log(`Simulated SMS: Verification code ${code} for phone ${phone}`);

    // For simulation, return the code in the response (remove this in production)
    return res.status(200).json({
      message: "Verification code sent (simulated)",
      code,
    });
  } catch (err) {
    console.error("Error sending code:", err);
    return res.status(500).json({ error: "Server error sending code" });
  }
};

/**
 * Verifies the provided code for the given phone number.
 * Retrieves the stored code from Redis, compares it, and deletes it upon success.
 */
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    console.log("verifyCode received:", { phone, code });  // Debug log

    if (!phone || !code) {
      return res.status(400).json({ error: "Phone number and code are required" });
    }

    const storedCode = await redisClient.get(`phoneCodes:${phone}`);
    console.log("Stored code from Redis:", storedCode);

    if (!storedCode) {
      return res.status(400).json({ error: "No code has been sent or it has expired" });
    }
    if (storedCode !== code) {
      return res.status(400).json({ error: "Incorrect verification code" });
    }

    await redisClient.del(`phoneCodes:${phone}`);
    return res.status(200).json({ message: "Code verified successfully (simulated)" });
  } catch (err) {
    console.error("Error verifying code:", err);
    return res.status(500).json({ error: "Server error during code verification" });
  }
};
