import { z } from "zod";

function parseAllowedHosts(value: string | undefined): Set<string> | null {
  if (!value?.trim()) return null;
  return new Set(
    value
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const env = z
  .object({
    DATABASE_URL: z.string().min(1),
    SHORT_LINK_BASE_URL: z.string().url(),
    API_KEY: z.string().min(8),
    IP_HASH_SALT: z.string().min(8),
    PORT: z.coerce.number().default(8002),
    DEFAULT_TTL_DAYS: z.coerce.number().int().positive().default(365),
    ALLOWED_TARGET_HOSTS: z.string().optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  })
  .parse({
    DATABASE_URL: process.env.DATABASE_URL,
    SHORT_LINK_BASE_URL: process.env.SHORT_LINK_BASE_URL,
    API_KEY: process.env.API_KEY,
    IP_HASH_SALT: process.env.IP_HASH_SALT,
    PORT: process.env.PORT,
    DEFAULT_TTL_DAYS: process.env.DEFAULT_TTL_DAYS,
    ALLOWED_TARGET_HOSTS: process.env.ALLOWED_TARGET_HOSTS,
    NODE_ENV: process.env.NODE_ENV,
  });

export const allowedTargetHosts = parseAllowedHosts(env.ALLOWED_TARGET_HOSTS);
