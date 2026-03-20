import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { createClient } from 'redis';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config({ path: '../../.env' });

const PORT = parseInt(process.env.PORT || '3002');
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Redis Subscriber
const redisSubscriber = createClient({ url: REDIS_URL });

redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Subscribe to Redis events
const initRedis = async () => {
  await redisSubscriber.connect();
  console.log('✅ Live Board connected to Redis');
  
  await redisSubscriber.subscribe('queue_events', (message) => {
    console.log('Received queue event:', message);
    
    // Broadcast to all connected clients
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });
};

initRedis().catch(console.error);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Live Board API is up' });
});

server.listen(PORT, () => {
  console.log('=================================');
  console.log(`📡 Live Board API running on port ${PORT}`);
  console.log('=================================');
});
