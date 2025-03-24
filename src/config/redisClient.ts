import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// Get the Redis URL from environment variables.
// For local development, you might use "redis://localhost:6379".
// In production on Render, you'll set REDIS_URL via the dashboard to your managed Redis instance.
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Creates a dummy Redis client with no-op implementations.
 * This client logs warnings and returns null (or does nothing) for all operations.
 */
function createDummyClient(): RedisClientType {
  console.warn("Using dummy Redis client.");
  return {
    get: async (key: string) => {
      console.warn(`Dummy Redis: get("${key}") called.`);
      return null;
    },
    set: async (key: string, value: string, options?: { EX: number }) => {
      console.warn(`Dummy Redis: set("${key}", "${value}") called.`);
    },
    del: async (key: string) => {
      console.warn(`Dummy Redis: del("${key}") called.`);
    },
    on: () => {
      /* no-op */
    },
    // The connect method is a no-op for the dummy client.
    connect: async () => {
      console.warn("Dummy Redis: connect() called.");
    }
  } as unknown as RedisClientType;
}

/**
 * Initializes and returns a Redis client.
 * If the connection fails, the function returns a dummy client.
 */
async function initRedisClient(): Promise<RedisClientType> {
  try {
    const client: RedisClientType = createClient({ url: redisUrl });
    client.on("error", (err) => {
      console.warn("Redis error:", err);
    });
    await client.connect();
    console.log("Connected to Redis successfully.");
    return client;
  } catch (err) {
    console.warn("Failed to connect to Redis, using dummy client:", err);
    return createDummyClient();
  }
}

// Initialize the Redis client (or dummy) once. All calls will await this promise.
const redisClientPromise = initRedisClient();

/**
 * Exported Redis client API.
 * Each method awaits the initialized client and then performs the operation.
 */
export default {
  async get(key: string): Promise<string | null> {
    const client = await redisClientPromise;
    return client.get(key);
  },
  async set(key: string, value: string, options?: { EX: number }): Promise<void> {
    const client = await redisClientPromise;
    await client.set(key, value, options);
  },
  async del(key: string): Promise<void> {
    const client = await redisClientPromise;
    await client.del(key);
  },
  on(event: string, listener: (...args: any[]) => void): void {
    redisClientPromise.then(client => client.on(event, listener));
  }
};
