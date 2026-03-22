import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { redisSubscriber } from "../config/redis.js";

export const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("🔌 New display connected");

    ws.send(
      JSON.stringify({
        type: "WELCOME",
        message: "Connected to Live Board API",
      }),
    );

    ws.on("close", () => {
      console.log("🔌 Display disconnected");
    });
  });

  // Subscribe to Redis events sent from queue-api
  redisSubscriber.subscribe("queue_events", (message) => {
    console.log("📣 Broadcasting queue event:", message);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  return wss;
};
