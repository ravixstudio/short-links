CREATE TYPE "public"."short_link_status" AS ENUM('active', 'revoked', 'expired');--> statement-breakpoint
CREATE TABLE "short_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"target_url" text NOT NULL,
	"target_host" text NOT NULL,
	"status" "short_link_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text,
	"source" text,
	"metadata" jsonb,
	"click_count" integer DEFAULT 0 NOT NULL,
	"first_accessed_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone,
	"last_referrer" text,
	"last_user_agent" text,
	"last_ip_hash" text,
	"unique_visitor_count" integer DEFAULT 0 NOT NULL,
	"revoked_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "short_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE INDEX "short_links_status_expires_at_idx" ON "short_links" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "short_links_target_host_idx" ON "short_links" USING btree ("target_host");--> statement-breakpoint
CREATE INDEX "short_links_source_idx" ON "short_links" USING btree ("source");
