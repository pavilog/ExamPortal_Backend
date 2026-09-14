import fs from "fs";
import path from "path";
import { pool } from "./pool";

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const dir = path.join(__dirname, "migrations");
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const already = await pool.query(
      "SELECT 1 FROM _migrations WHERE name = $1",
      [file],
    );
    if (already.rows.length > 0) {
      console.log(`↷ Already applied: ${file}`);
      continue;
    }

    console.log(`▶ Applying: ${file}`);
    const sql = fs.readFileSync(path.join(dir, file), "utf-8");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO _migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`✅ Done: ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`❌ Migration failed: ${file}`);
      console.error(err);
      process.exit(1);
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log("All migrations complete.");
}

runMigrations();
