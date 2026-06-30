import { Hono } from "hono";
import { z } from "zod";

import { getClientIp } from "../middleware/auth.js";
import {
  getShortLinkBySlug,
  isResolvable,
  recordRedirectAccess,
} from "../services/short-link.service.js";

const slugSchema = z.string().min(4).max(64);

export const redirectRoutes = new Hono();

redirectRoutes.get("/:slug", async (c) => {
  const parsed = slugSchema.safeParse(c.req.param("slug"));
  if (!parsed.success) {
    return c.text("Not found", 404);
  }

  const link = await getShortLinkBySlug(parsed.data);
  if (!isResolvable(link)) {
    return c.text("This link is invalid or has expired.", 404);
  }

  void recordRedirectAccess(link, {
    referrer: c.req.header("referer") ?? c.req.header("referrer"),
    userAgent: c.req.header("user-agent"),
    ip: getClientIp(c),
  });

  return c.redirect(link.targetUrl, 302);
});
