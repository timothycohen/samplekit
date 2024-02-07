CREATE TABLE IF NOT EXISTS "presigned_url" (
	"user_id" varchar NOT NULL,
	"url" varchar PRIMARY KEY NOT NULL,
	"created" timestamp NOT NULL,
	CONSTRAINT "presigned_url_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "presigned_url" ADD CONSTRAINT "presigned_url_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
