// backend/src/config/redisClient.ts
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (err) => console.error("Redis error:", err));

redisClient.connect().catch((err) => {
  console.error("Error connecting to Redis:", err);
});

export default redisClient;
