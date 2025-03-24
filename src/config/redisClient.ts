import { createClient } from "redis";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: "../.env" });

// Use the REDIS_URL environment variable.
// In production on Render, set REDIS_URL to the managed Redis URL provided by Render.
// For local development, you can use: redis://localhost:6379
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const redisClient = createClient({ url: redisUrl });

// Listen for Redis connection errors
redisClient.on("error", (err) =>
  console.error("Redis error:", err)
);

// Connect to Redis; log errors if any.
redisClient.connect().catch((err) => {
  console.error("Error connecting to Redis:", err);
});

export default redisClient;
