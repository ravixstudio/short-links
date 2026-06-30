import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { env } from "../config/env.js";
import * as schema from "./schema.js";

function shouldUseSsl(connectionString: string): boolean {
  if (connectionString.includes("sslmode=disable")) return false;
  if (connectionString.includes("sslmode=require")) return true;
  if (env.NODE_ENV !== "production") return false;
  try {
    const host = new URL(connectionString).hostname;
    return host !== "localhost" && host !== "postgres" && host !== "127.0.0.1";
  } catch {
    return env.NODE_ENV === "production";
  }
}

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: shouldUseSsl(env.DATABASE_URL) ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

export async function connectDB(): Promise<void> {
  await pool.query("SELECT 1");
}

export async function runMigrations(): Promise<void> {
  await migrate(db, { migrationsFolder: "./drizzle" });
}

export async function closeDB(): Promise<void> {
  await pool.end();
}
