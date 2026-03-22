import { Pool } from "pg";
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id SERIAL PRIMARY KEY,
        queue_number INTEGER NOT NULL,
        pax INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'WAITING', -- WAITING, CALLED, COMPLETED, SKIPPED, CANCELLED
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Database (Postgres) Initialized & Tables Created");
  } catch (err) {
    console.error("❌ Database Initialization Error:", err);
  } finally {
    client.release();
  }
};
