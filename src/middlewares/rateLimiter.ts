// backend/src/middlewares/rateLimiter.ts
import rateLimit from "express-rate-limit";

/**
 * Rate limiting middleware: limits each IP to 100 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again after 15 minutes",
});
