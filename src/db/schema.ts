import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const shortLinkStatusEnum = pgEnum("short_link_status", [
  "active",
  "revoked",
  "expired",
]);

export const shortLinksTable = pgTable(
  "short_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    targetUrl: text("target_url").notNull(),
    targetHost: text("target_host").notNull(),
    status: shortLinkStatusEnum("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    createdBy: text("created_by"),
    source: text("source"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    clickCount: integer("click_count").notNull().default(0),
    firstAccessedAt: timestamp("first_accessed_at", {
      withTimezone: true,
      mode: "date",
    }),
    lastAccessedAt: timestamp("last_accessed_at", {
      withTimezone: true,
      mode: "date",
    }),
    lastReferrer: text("last_referrer"),
    lastUserAgent: text("last_user_agent"),
    lastIpHash: text("last_ip_hash"),
    uniqueVisitorCount: integer("unique_visitor_count").notNull().default(0),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("short_links_status_expires_at_idx").on(table.status, table.expiresAt),
    index("short_links_target_host_idx").on(table.targetHost),
    index("short_links_source_idx").on(table.source),
  ],
);

export type ShortLink = typeof shortLinksTable.$inferSelect;
export type NewShortLink = typeof shortLinksTable.$inferInsert;
