import type { Context, Next } from "hono";

import { env } from "../config/env.js";

export async function apiKeyAuth(c: Context, next: Next): Promise<Response | void> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (token !== env.API_KEY) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  await next();
}

export function getClientIp(c: Context): string | null {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? null;
  }
  return c.req.header("x-real-ip") ?? null;
}
