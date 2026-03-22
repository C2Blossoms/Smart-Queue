import { pool } from "../config/db.js";
import { redisClient } from "../config/redis.js";
import * as TicketsService from "./tickets.service.js";

export const broadcastNext = async () => {
  const status = await TicketsService.getStatus();
  await redisClient.publish(
    "queue_events",
    JSON.stringify({
      type: "QUEUE_STATUS_UPDATED",
      payload: status,
    }),
  );
};

export const getActive = async () => {
  const result = await pool.query(
    `SELECT * FROM tickets WHERE status = 'CALLED' ORDER BY id ASC LIMIT 1`,
  );
  return result.rows[0] || null;
};

export const callNext = async () => {
  // Self-healing: if admin calls next without completing previous, mark it skipped
  await pool.query(`UPDATE tickets SET status = 'SKIPPED' WHERE status = 'CALLED'`);
  const findResult = await pool.query(
    `SELECT * FROM tickets WHERE status = 'WAITING' ORDER BY id ASC LIMIT 1`,
  );

  if (findResult.rows.length === 0) {
    return null;
  }

  const updateResult = await pool.query(
    `UPDATE tickets SET status = 'CALLED'
    WHERE id = (
      SELECT id FROM tickets
      WHERE status = 'WAITING'
      ORDER BY id ASC LIMIT 1
      FOR UPDATE SKIP LOCKED
    ) RETURNING *`,
  );

  const updatedTicket = updateResult.rows[0];

  await redisClient.publish(
    "queue_events",
    JSON.stringify({
      type: "TICKET_CALLED",
      payload: updatedTicket,
    }),
  );

  await broadcastNext();

  return updatedTicket;
};

export const completeTicket = async (id: string | number) => {
  await pool.query(`UPDATE tickets SET status = 'COMPLETED' WHERE id = $1`, [id]);
  await redisClient.publish("queue_events", JSON.stringify({ type: "TICKET_COMPLETED", payload: { id } }));
  await broadcastNext();
};

export const skipTicket = async (id: string | number) => {
  await pool.query(`UPDATE tickets SET status = 'SKIPPED' WHERE id = $1`, [id]);
  await redisClient.publish("queue_events", JSON.stringify({ type: "TICKET_SKIPPED", payload: { id } }));
  await broadcastNext();
};
