import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import http from "node:http";
import { connectRedis } from "./config/redis.js";
import { setupWebSocket } from "./socket/socketSetup.js";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "🚀 Live Board API is running with WebSockets!",
  });
});

const server = http.createServer(app);

// Attach WebSocket Server onto the standard HTTP server
setupWebSocket(server);

const startServer = async () => {
  await connectRedis();

  server.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`📡 Live Board API running on port`, PORT);
    console.log(`=================================`);
  });
};

startServer();
