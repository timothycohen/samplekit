ALTER TABLE "session" RENAME COLUMN "lastSeen" TO "last_seen";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "send_time" TO "temp_confirmation_expires";