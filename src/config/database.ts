// backend/src/config/database.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g., "postgresql://user:password@host:5432/dbname?sslmode=require"
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 10,
});

export default pool;
