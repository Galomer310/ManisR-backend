import { createPool } from "mysql2";
import * as dotenv from "dotenv";
dotenv.config();

// Create and export a MySQL connection pool.
const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

export default pool;
