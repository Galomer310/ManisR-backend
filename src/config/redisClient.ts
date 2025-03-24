import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// Get the Redis URL from environment variables.
// For local development, you might use "redis://localhost:6379".
// For production on Render, if you don't have a managed Redis instance,
// set REDIS_URL to "dummy" in Render's dashboard to force the dummy client.
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Creates a dummy Redis client with no-op implementations.
 * This client logs warnings and returns null (or does nothing) for all operations.
 */
function createDummyClient(): RedisClientType {
  console.warn("Using dummy Redis client.");
  return {
    async get(key: string): Promise<string | null> {
      console.warn(`Dummy Redis: get("${key}") called.`);
      return null;
    },
    async set(key: string, value: string, options?: { EX: number }): Promise<void> {
      console.warn(`Dummy Redis: set("${key}", "${value}") called.`);
    },
    async del(key: string): Promise<void> {
      console.warn(`Dummy Redis: del("${key}") called.`);
    },
    on: (_: string, __: (...args: any[]) => void): void => {
      // No-op
    },
    async connect(): Promise<void> {
      console.warn("Dummy Redis: connect() called. Skipping connection.");
    }
  } as unknown as RedisClientType;
}

/**
 * Initializes and returns a Redis client.
 * If the connection fails or if REDIS_URL is set to "dummy", the function returns a dummy client.
 */
async function initRedisClient(): Promise<RedisClientType> {
  // If REDIS_URL is set to "dummy", return the dummy client immediately.
  if (redisUrl === "dummy") {
    console.warn("REDIS_URL set to 'dummy'. Skipping real Redis connection.");
    return createDummyClient();
  }

  try {
    // Force the type by casting the result from createClient to RedisClientType
    const client = createClient({ url: redisUrl }) as unknown as RedisClientType;
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
    redisClientPromise.then((client) => client.on(event, listener));
  }
};
