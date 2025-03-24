// backend/src/controllers/CodeController.ts

import { Request, Response } from "express";
import { randomInt } from "crypto";
import redisClient from "../config/redisClient";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// In-memory store to simulate Redis when using the dummy client.
const simulatedCodes: { [email: string]: string } = {};

/**
 * Create a Nodemailer transporter using SMTP credentials.
 * For testing, Ethereal Email is used.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a verification code to the provided email.
 * - Generates a 6-digit code.
 * - Stores it in Redis or in a simulated in-memory store if using "dummy".
 * - Sends the code via email using Nodemailer.
 * - Returns the code in the response (for testing purposes).
 */
export const sendCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    console.log("sendCode received body:", req.body);
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Generate a 6-digit code
    const code = String(randomInt(100000, 1000000));
    console.log(`Generated code: ${code}`);
    const expirySeconds = 300;

    if ((process.env.REDIS_URL || "").trim() === "dummy") {
      simulatedCodes[email] = code;
    } else {
      await redisClient.set(`emailCodes:${email}`, code, { EX: expirySeconds });
    }

    // Set up email options
    const mailOptions = {
      from: `"ManisR App" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    };

    console.log("Mail options:", mailOptions);

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
    console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

    return res.status(200).json({
      message: "Verification code sent via email (simulated)",
      code, // For testing only!
    });
  } catch (err) {
    console.error("Error sending email via Nodemailer:", err);
    return res.status(500).json({ error: "Server error sending code" });
  }
};

/**
 * Verifies the provided code for the given email.
 * - Retrieves the stored code from Redis or the simulated store.
 * - Compares it with the provided code.
 * - On success, deletes the code and returns a JWT token.
 */
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    console.log("verifyCode received:", { email, code });
    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required" });
    }

    let storedCode: string | null = null;
    if ((process.env.REDIS_URL || "").trim() === "dummy") {
      storedCode = simulatedCodes[email] || null;
    } else {
      storedCode = await redisClient.get(`emailCodes:${email}`);
    }
    console.log("Stored code for email:", { email, storedCode });

    if (!storedCode) {
      return res.status(400).json({ error: "No code has been sent or it has expired" });
    }
    if (storedCode !== code) {
      return res.status(400).json({ error: "Incorrect verification code" });
    }

    // Remove the stored code after verification
    if ((process.env.REDIS_URL || "").trim() === "dummy") {
      delete simulatedCodes[email];
    } else {
      await redisClient.del(`emailCodes:${email}`);
    }

    // Generate a JWT token for the user (using email as the identifier)
    const token = jwt.sign({ email }, process.env.JWT_SECRET || "fallbackSecret", { expiresIn: "1d" });
    return res.status(200).json({
      message: "Code verified successfully (simulated)",
      token,
      user: { email },
    });
  } catch (err) {
    console.error("Error verifying code:", err);
    return res.status(500).json({ error: "Server error during code verification" });
  }
};
