import { Pool } from "pg";

let pool: Pool | undefined;

export function databaseUrl() {
  return process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;
}

export function databaseIsConfigured() {
  return Boolean(databaseUrl());
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: databaseUrl(),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
      ssl: databaseUrl()?.includes("localhost") ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}
