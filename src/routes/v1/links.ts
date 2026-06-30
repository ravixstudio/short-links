import { Hono } from "hono";
import { z } from "zod";

import { apiKeyAuth } from "../../middleware/auth.js";
import {
  buildPublicLink,
  createShortLink,
} from "../../services/short-link.service.js";

const createLinkSchema = z.object({
  long_url: z.string().url(),
  source: z.string().min(1).max(64).optional(),
  created_by: z.string().min(1).max(128).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const linksRoutes = new Hono();

linksRoutes.post("/", apiKeyAuth, async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Invalid JSON body" }, 400);
  }

  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ message: "Invalid request", errors: parsed.error.flatten() }, 400);
  }

  try {
    const row = await createShortLink({
      longUrl: parsed.data.long_url,
      source: parsed.data.source,
      createdBy: parsed.data.created_by,
      metadata: parsed.data.metadata,
    });

    return c.json({
      link: buildPublicLink(row.slug),
      id: row.id,
      slug: row.slug,
      created_at: row.createdAt.toISOString(),
      expires_at: row.expiresAt.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create link";
    if (message.includes("Target host not allowed")) {
      return c.json({ message }, 400);
    }
    console.error("create link failed", error);
    return c.json({ message: "Failed to create link" }, 500);
  }
});
