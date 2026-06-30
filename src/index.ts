import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { env } from "./config/env.js";
import { connectDB, runMigrations } from "./db/connection.js";
import { redirectRoutes } from "./routes/redirect.js";
import { linksRoutes } from "./routes/v1/links.js";

const app = new Hono();

app.use("*", cors({ origin: "*" }));

app.get("/", (c) => c.json({ status: "ok", service: "short-links" }));

app.get("/health", (c) =>
  c.json({ status: "healthy", timestamp: new Date().toISOString() }),
);

app.route("/v1/links", linksRoutes);
app.route("/", redirectRoutes);

async function start(): Promise<void> {
  await runMigrations();
  await connectDB();

  serve({
    fetch: app.fetch,
    port: env.PORT,
    hostname: "::",
  });

  console.log(`Short-links service running on port ${env.PORT}`);
}

void start().catch((error) => {
  console.error("Failed to start short-links service", error);
  process.exit(1);
});

export { app };
