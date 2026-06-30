import { createHash, randomBytes } from "node:crypto";

import { and, eq, isNull } from "drizzle-orm";

import { allowedTargetHosts, env } from "../config/env.js";
import { db } from "../db/connection.js";
import { shortLinksTable, type ShortLink } from "../db/schema.js";
import { computeShortLinkResolveState } from "../lib/resolve-state.js";

const SLUG_LENGTH = 10;
const MAX_SLUG_RETRIES = 8;

function randomSlug(): string {
  return randomBytes(8).toString("base64url").slice(0, SLUG_LENGTH);
}

function isUniqueViolation(error: unknown): boolean {
  const err = error as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

export function parseTargetHost(targetUrl: string): string {
  return new URL(targetUrl).hostname.toLowerCase();
}

export function assertTargetUrlAllowed(targetUrl: string): void {
  const host = parseTargetHost(targetUrl);
  if (allowedTargetHosts && !allowedTargetHosts.has(host)) {
    throw new Error(`Target host not allowed: ${host}`);
  }
}

export function hashClientIp(ip: string | undefined): string | null {
  if (!ip?.trim()) return null;
  return createHash("sha256")
    .update(`${env.IP_HASH_SALT}:${ip.trim()}`)
    .digest("hex");
}

export function defaultExpiresAt(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.DEFAULT_TTL_DAYS);
  return expiresAt;
}

export function buildPublicLink(slug: string): string {
  const base = env.SHORT_LINK_BASE_URL.replace(/\/$/, "");
  return `${base}/${encodeURIComponent(slug)}`;
}

export type CreateLinkInput = {
  longUrl: string;
  source?: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
};

export async function createShortLink(input: CreateLinkInput): Promise<ShortLink> {
  assertTargetUrlAllowed(input.longUrl);
  const targetHost = parseTargetHost(input.longUrl);
  const expiresAt = input.expiresAt ?? defaultExpiresAt();

  for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
    const slug = randomSlug();
    try {
      const [row] = await db
        .insert(shortLinksTable)
        .values({
          slug,
          targetUrl: input.longUrl,
          targetHost,
          expiresAt,
          source: input.source ?? "document_share",
          createdBy: input.createdBy ?? "innoventry-document-service",
          metadata: input.metadata ?? null,
        })
        .returning();
      return row;
    } catch (error: unknown) {
      if (isUniqueViolation(error)) continue;
      throw error;
    }
  }

  throw new Error("Unable to allocate unique short link slug after retries");
}

export async function getShortLinkBySlug(slug: string): Promise<ShortLink | null> {
  const [row] = await db
    .select()
    .from(shortLinksTable)
    .where(and(eq(shortLinksTable.slug, slug.trim()), isNull(shortLinksTable.deletedAt)))
    .limit(1);
  return row ?? null;
}

export type AccessContext = {
  referrer?: string | null;
  userAgent?: string | null;
  ip?: string | null;
};

export async function recordRedirectAccess(
  link: ShortLink,
  context: AccessContext,
): Promise<void> {
  const now = new Date();
  const ipHash = hashClientIp(context.ip ?? undefined);
  const isNewVisitor =
    ipHash !== null &&
    link.lastIpHash !== ipHash &&
    (link.lastUserAgent ?? null) !== (context.userAgent ?? null);

  await db
    .update(shortLinksTable)
    .set({
      clickCount: link.clickCount + 1,
      firstAccessedAt: link.firstAccessedAt ?? now,
      lastAccessedAt: now,
      lastReferrer: context.referrer ?? null,
      lastUserAgent: context.userAgent ?? null,
      lastIpHash: ipHash,
      uniqueVisitorCount: isNewVisitor
        ? link.uniqueVisitorCount + 1
        : link.uniqueVisitorCount,
      updatedAt: now,
    })
    .where(eq(shortLinksTable.id, link.id));
}

export function isResolvable(link: ShortLink | null): link is ShortLink {
  if (!link) return false;
  return computeShortLinkResolveState(link) === "active";
}
