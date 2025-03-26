// backend/src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Create and export a PostgreSQL connection pool.
// Note: We assume DB_HOST, DB_USER, DB_PASSWORD, DB_NAME and optionally DB_PORT are defined in your .env file.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432, // default PostgreSQL port
});

export default pool;
