import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { env } from "../config/env.js";
import * as schema from "./schema.js";

function shouldUseSsl(connectionString: string): boolean {
  if (connectionString.includes("sslmode=disable")) return false;
  if (connectionString.includes("sslmode=require")) return true;
  try {
    const host = new URL(connectionString).hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "postgres" ||
      host.endsWith(".railway.internal")
    ) {
      return false;
    }
  } catch {
    return env.NODE_ENV === "production";
  }
  return env.NODE_ENV === "production";
}

async function retry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 12,
  delayMs = 5000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`${label} failed (attempt ${attempt}/${attempts})`, error);
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }
  throw lastError;
}

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: shouldUseSsl(env.DATABASE_URL) ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });

export async function connectDB(): Promise<void> {
  await retry("database connect", async () => {
    await pool.query("SELECT 1");
  });
}

export async function runMigrations(): Promise<void> {
  await retry("database migrate", async () => {
    await migrate(db, { migrationsFolder: "./drizzle" });
  });
}

export async function closeDB(): Promise<void> {
  await pool.end();
}
