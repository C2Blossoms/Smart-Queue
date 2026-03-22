import { pool } from "../config/db.js";
import { redisClient } from "../config/redis.js";

export const getStatus = async () => {
  const query = await pool.query(`
    SELECT 
      (SELECT queue_number FROM tickets WHERE status = 'CALLED' ORDER BY id DESC LIMIT 1) as current_called,
      (SELECT count(*) FROM tickets WHERE status = 'WAITING') as waiting_count
  `);

  const result = query.rows[0];
  return {
    current_called: result.current_called || null,
    waiting_count: Number.parseInt(result.waiting_count || "0", 10),
  };
};

export const joinQueue = async (pax: number) => {
  const today = new Date().toISOString().split("T")[0];
  const redisKey = `queue_number:${today}`;

  const newQueueNumber = await redisClient.incr(redisKey);

  const result = await pool.query(
    `INSERT INTO tickets (queue_number, pax, status) VALUES ($1, $2, 'WAITING') RETURNING *`,
    [newQueueNumber, pax],
  );

  const ticket = result.rows[0];

  await redisClient.publish(
    "queue_events",
    JSON.stringify({
      type: "TICKET_JOINED",
      payload: ticket,
    }),
  );

  return ticket;
};

export const getHistory = async () => {
  const query = await pool.query(
    `SELECT * FROM tickets WHERE status IN ('COMPLETED', 'SKIPPED') ORDER BY id DESC LIMIT 20`,
  );
  return query.rows;
};

export const getTicket = async (id: string | number) => {
  const query = await pool.query(
    `
    SELECT t.*, 
    (SELECT count(*) FROM tickets w WHERE w.status = 'WAITING' AND w.id < t.id) as queues_ahead
    FROM tickets t WHERE t.id = $1
  `,
    [id],
  );
  return query.rows[0] || null;
};
