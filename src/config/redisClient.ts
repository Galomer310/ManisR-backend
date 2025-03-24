import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config({ path: "../.env" });

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Create the Redis client using the connection URL from environment variables.
const client: RedisClientType = createClient({ url: redisUrl });

// Create a dummy fallback client that provides no-op implementations.
// These functions do nothing (or return null) so that calls won't crash your app.
const dummyClient = {
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
  on(_: string, __: (...args: any[]) => void): void {
    // No-op
  },
  async connect(): Promise<void> {
    console.warn("Dummy Redis: connect() called. Not connecting to Redis.");
  }
};

// We'll use a variable to hold our "active" client (either the real one or the dummy)
let redisClient: RedisClientType | typeof dummyClient = dummyClient;

// Attempt to connect to Redis. If successful, assign the real client; if not, keep the dummy.
client.on('error', (err) => {
  console.warn("Redis error, switching to dummy client:", err);
  redisClient = dummyClient;
});

client.connect()
  .then(() => {
    console.log("Connected to Redis successfully.");
    redisClient = client;
  })
  .catch((err) => {
    console.warn("Failed to connect to Redis, using dummy client:", err);
    redisClient = dummyClient;
  });

// Export an object with the Redis API methods.
// These methods will call the currently active client (either real or dummy).
export default {
  async get(key: string): Promise<string | null> {
    return redisClient.get(key);
  },
  async set(key: string, value: string, options?: { EX: number }): Promise<void> {
    await redisClient.set(key, value, options);
  },
  async del(key: string): Promise<void> {
    await redisClient.del(key);
  },
  on(event: string, listener: (...args: any[]) => void): void {
    redisClient.on(event, listener);
  },
  async connect(): Promise<void> {
    await redisClient.connect();
  }
};
