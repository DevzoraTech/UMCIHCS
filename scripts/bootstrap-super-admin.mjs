import pg from "pg";
import { hashPassword } from "better-auth/crypto";

const connectionString = process.env.NETLIFY_DB_URL ?? process.env.DATABASE_URL;
const name = process.env.SUPERADMIN_NAME?.trim();
const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD;
if (!connectionString || !name || !email || !password) throw new Error("Set the database URL, SUPERADMIN_NAME, SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD.");
if (password.length < 12) throw new Error("SUPERADMIN_PASSWORD must contain at least 12 characters.");

const pool = new pg.Pool({ connectionString, ssl: connectionString.includes("localhost") ? false : { rejectUnauthorized: false } });
const client = await pool.connect();
try {
  await client.query("begin");
  const existing = await client.query('select id from "user" where lower(email)=lower($1)', [email]);
  const userId = existing.rows[0]?.id ?? crypto.randomUUID();
  if (existing.rows[0]) {
    await client.query('update "user" set name=$2, role=\'super_admin\', "emailVerified"=true, "updatedAt"=now() where id=$1', [userId, name]);
  } else {
    await client.query('insert into "user" (id,name,email,"emailVerified",role) values ($1,$2,$3,true,\'super_admin\')', [userId, name, email]);
  }
  const hashed = await hashPassword(password);
  await client.query('insert into account (id,"accountId","providerId","userId",password) values ($1,$2,\'credential\',$2,$3) on conflict ("providerId","accountId") do update set password=excluded.password,"updatedAt"=now()', [crypto.randomUUID(), userId, hashed]);
  await client.query("commit");
  console.log(`Super Administrator ready: ${email}`);
} catch (error) {
  await client.query("rollback");
  throw error;
} finally {
  client.release();
  await pool.end();
}
