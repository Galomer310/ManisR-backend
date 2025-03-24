// backend/src/config/database.ts

import { createPool } from "mysql2";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

// Create a connection pool for MySQL.
// Adjust connectionLimit as needed.
const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// Export the pool to be used in queries.
export default pool;
