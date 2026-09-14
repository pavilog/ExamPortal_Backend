import { Pool } from "pg";
import { env } from "../config/env";

/**
 * This is THE connection to PostgreSQL for the whole app.
 * Import `pool` wherever you need to run a query — never create
 * a second `new Pool()` anywhere else.
 */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error on idle client:", err);
});

export async function checkDatabaseConnection(): Promise<void> {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT NOW()");
    console.log("✅ PostgreSQL connected. Server time:", result.rows[0].now);
  } finally {
    client.release();
  }
}
