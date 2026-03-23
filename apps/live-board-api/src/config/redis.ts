import { createClient } from "redis";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export const redisClient = createClient(
  process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {}
);

export const redisSubscriber = createClient(
  process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {}
);

redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisSubscriber.on("error", (err) =>
  console.error("❌ Redis Subscriber Error:", err),
);

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    await redisSubscriber.connect();
    console.log("✅ Redis (Client & Subscriber) Connected");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
};
