import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const connectionString = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set NETLIFY_DB_URL or DATABASE_URL before running migrations.");

const pool = new pg.Pool({ connectionString, ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false } });
try {
  const root = resolve("netlify/database/migrations");
  const entries = (await readdir(root, { recursive: true })).filter(path => path.endsWith("migration.sql")).sort();
  for (const entry of entries) await pool.query(await readFile(resolve(root, entry), "utf8"));
  console.log("UMCIHCS portal database is ready.");
} finally {
  await pool.end();
}
