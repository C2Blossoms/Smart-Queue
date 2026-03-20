import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db.js';
import { connectRedis } from './redis.js';
import ticketRoutes from './routes/ticket.js';
import staffRoutes from './routes/staff.js';


dotenv.config({ path: '../../.env' });

const app = express();

const PORT = Math.floor(parseInt(process.env.PORT || '3001')); 

app.use(cors());
app.use(express.json());

// Testing route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: '🚀 Queue API is ready to accept bookings!' 
  });
});

app.use('/api/tickets', ticketRoutes);
app.use('/api/queue', staffRoutes);

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