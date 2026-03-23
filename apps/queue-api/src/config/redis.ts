import { createClient } from "redis";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export const redisClient = createClient(
  process.env.REDIS_URL ? { url: process.env.REDIS_URL } : {}
);

redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis Connected");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err);
  }
};
