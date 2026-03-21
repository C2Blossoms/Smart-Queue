import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { initDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import mainRouter from "./routes/router.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const app = express();

const PORT = Math.floor(Number.parseInt(process.env.PORT || "3001"));

app.use(cors());
app.use(express.json());

// Testing API
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "🚀 Queue API is ready to accept bookings!",
  });
});

app.use("/api", mainRouter);

// Error Handling Middleware (must be after all routes)
app.use(errorHandler);

// Start Server
const startServer = async () => {
  await initDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Queue API is running on port ${PORT}`);
    console.log(`=================================`);
  });
};

startServer();
