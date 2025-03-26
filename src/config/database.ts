// backend/src/config/database.ts
import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

// For NeonDB and other managed PostgreSQL services, SSL is required.
// Force SSL by setting rejectUnauthorized to false.
const pool = new Pool({
  host: process.env.PGHOST,                              // e.g., "ep-holy-snow-a2tbt5yf-pooler.eu-central-1.aws.neon.tech"
  port: parseInt(process.env.PGPORT || "5432", 10),       // PostgreSQL port
  user: process.env.PGUSER,                              // e.g., "manisr_db_owner"
  password: process.env.PGPASSWORD,                      // Your DB password
  database: process.env.PGDATABASE,                      // Your DB name
  max: 10,
  // Always use SSL for NeonDB
  ssl: { rejectUnauthorized: false },
});

export default pool;
