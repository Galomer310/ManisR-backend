import { Request, Response } from "express";
import { randomInt } from "crypto";
import redisClient from "../config/redisClient";

// In-memory store to simulate Redis when using the dummy client.
// This object maps phone numbers to verification codes.
const simulatedCodes: { [phone: string]: string } = {};

/**
 * Sends a simulated verification code to the provided phone number.
 * - Generates a 6-digit code.
 * - If REDIS_URL is set to "dummy", stores the code in the in-memory store.
 *   Otherwise, stores the code in Redis with a 5-minute expiry.
 * - Logs the code to the console and returns it in the response (for testing).
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
    
    // Check if we're using the dummy Redis client
    if ((process.env.REDIS_URL || "").trim() === "dummy") {
      // Store in the simulated in-memory store
      simulatedCodes[phone] = code;
    } else {
      // Store in the real Redis instance
      await redisClient.set(`phoneCodes:${phone}`, code, { EX: expirySeconds });
    }
    
    console.log(`Simulated SMS: Verification code ${code} for phone ${phone}`);
    
    // Return the code in the JSON response for testing purposes.
    // Remove this in production.
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
 * - Retrieves the stored code from either Redis or the in-memory store.
 * - Compares the stored code with the code provided by the client.
 * - If they match, removes the code and returns a success message.
 */
export const verifyCode = async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    console.log("verifyCode received:", { phone, code });
    
    if (!phone || !code) {
      return res.status(400).json({ error: "Phone number and code are required" });
    }
    
    let storedCode: string | null = null;
    if ((process.env.REDIS_URL || "").trim() === "dummy") {
      storedCode = simulatedCodes[phone] || null;
    } else {
      storedCode = await redisClient.get(`phoneCodes:${phone}`);
    }
    
    console.log("Stored code for phone:", { phone, storedCode });
    
    if (!storedCode) {
      return res.status(400).json({ error: "No code has been sent or it has expired" });
    }
    if (storedCode !== code) {
      return res.status(400).json({ error: "Incorrect verification code" });
    }
    
    // Remove the code after verification
    if ((process.env.REDIS_URL || "").trim() === "dummy") {
      delete simulatedCodes[phone];
    } else {
      await redisClient.del(`phoneCodes:${phone}`);
    }
    
    return res.status(200).json({ message: "Code verified successfully (simulated)" });
  } catch (err) {
    console.error("Error verifying code:", err);
    return res.status(500).json({ error: "Server error during code verification" });
  }
};
