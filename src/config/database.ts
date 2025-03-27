import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // Loads .env locally

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool({
  // Tells 'pg' to use your environment variable
  connectionString: process.env.DATABASE_URL,
  // Neon requires SSL, so we set rejectUnauthorized = false
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
