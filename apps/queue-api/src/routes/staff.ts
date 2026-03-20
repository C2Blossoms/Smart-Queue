import express from 'express';
import type { Request, Response } from 'express';
import { pool } from '../db.js';
import { redisClient } from '../redis.js';

const router = express.Router();

// Helper to broadcast overall changes
const broadcastNext = async () => {
  const query = await pool.query(`
    SELECT 
      (SELECT queue_number FROM tickets WHERE status = 'CALLED' ORDER BY id DESC LIMIT 1) as current_called,
      (SELECT count(*) FROM tickets WHERE status = 'WAITING') as waiting_count
  `);
  
  await redisClient.publish('queue_events', JSON.stringify({
    type: 'QUEUE_STATUS_UPDATED',
    payload: {
      current_called: query.rows[0].current_called || null,
      waiting_count: parseInt(query.rows[0].waiting_count || '0', 10)
    }
  }));
};

// POST /api/queue/call-next
router.post('/call-next', async (req: Request, res: Response) => {
  try {
    // 1. Get the oldest 'WAITING' ticket
    const findResult = await pool.query(
      `SELECT * FROM tickets WHERE status = 'WAITING' ORDER BY id ASC LIMIT 1`
    );
    
    if (findResult.rows.length === 0) {
      res.status(404).json({ message: 'No waiting tickets' });
      return;
    }
    
    const nextTicket = findResult.rows[0];
    
    // 2. Mark it as 'CALLED'
    const updateResult = await pool.query(
      `UPDATE tickets SET status = 'CALLED' WHERE id = $1 RETURNING *`,
      [nextTicket.id]
    );
    
    const updatedTicket = updateResult.rows[0];
    
    // 3. Publish specific call event
    await redisClient.publish('queue_events', JSON.stringify({
      type: 'TICKET_CALLED',
      payload: updatedTicket
    }));
    
    // 4. Publish overall status update
    await broadcastNext();
    
    res.json({ message: 'Call next success', ticket: updatedTicket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/queue/:id/complete
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE tickets SET status = 'COMPLETED' WHERE id = $1`, [id]);
    await broadcastNext();
    res.json({ message: `Ticket ${id} completed` });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /api/queue/:id/skip
router.put('/:id/skip', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE tickets SET status = 'SKIPPED' WHERE id = $1`, [id]);
    await broadcastNext();
    res.json({ message: `Ticket ${id} skipped` });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
