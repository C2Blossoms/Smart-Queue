import express from 'express';
import type { Request, Response } from 'express';
import { pool } from '../db.js';
import { redisClient } from '../redis.js';

const router = express.Router();

// GET /api/tickets/status - ดูสถานะคิวล่าสุด
router.get('/status', async (req: Request, res: Response) => {
  try {
    const query = await pool.query(`
      SELECT 
        (SELECT queue_number FROM tickets WHERE status = 'CALLED' ORDER BY id DESC LIMIT 1) as current_called,
        (SELECT count(*) FROM tickets WHERE status = 'WAITING') as waiting_count
    `);
    
    const result = query.rows[0];
    res.json({
      current_called: result.current_called || null,
      waiting_count: parseInt(result.waiting_count || '0', 10)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/tickets/join - กดรับคิว
router.post('/join', async (req: Request, res: Response) => {
  try {
    const { pax = 1 } = req.body;
    
    // Generate date prefix (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    const redisKey = `queue_number:${today}`;
    
    // Get new queue number (atomic)
    const newQueueNumber = await redisClient.incr(redisKey);
    
    // Save to Postgres
    const result = await pool.query(
      `INSERT INTO tickets (queue_number, pax, status) VALUES ($1, $2, 'WAITING') RETURNING *`,
      [newQueueNumber, pax]
    );
    
    const ticket = result.rows[0];
    
    // Publish event queue_events
    await redisClient.publish('queue_events', JSON.stringify({
      type: 'TICKET_JOINED',
      payload: ticket
    }));
    
    res.status(201).json({ message: 'Queue joined successfully', ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
