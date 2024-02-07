CREATE TABLE IF NOT EXISTS "auth_provider" (
	"kind" varchar NOT NULL,
	"email" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"email_verified" boolean NOT NULL,
	"hashed_password" varchar,
	"authenticator" varchar,
	"passkeys" jsonb,
	"sms" varchar,
	CONSTRAINT "auth_provider_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"idle_expires" timestamp NOT NULL,
	"active_expires" timestamp NOT NULL,
	"awaiting_mfa" boolean NOT NULL,
	"awaiting_email_veri" boolean NOT NULL,
	"persistent" boolean NOT NULL,
	"os" varchar,
	"browser" varchar,
	"ip" varchar,
	"login" timestamp NOT NULL,
	"lastSeen" timestamp NOT NULL,
	"send_time" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_email_veri" (
	"user_id" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	"send_count" smallint NOT NULL,
	"send_time" timestamp NOT NULL,
	"token" varchar NOT NULL,
	CONSTRAINT "token_email_veri_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "token_email_veri_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_passkey_challenge" (
	"user_id" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	"token" varchar NOT NULL,
	CONSTRAINT "token_passkey_challenge_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_pw_reset" (
	"user_id" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	"send_count" smallint NOT NULL,
	"send_time" timestamp NOT NULL,
	"token" varchar NOT NULL,
	CONSTRAINT "token_pw_reset_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "token_pw_reset_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_setup_authenticator" (
	"user_id" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	"veri_attempt_count" smallint NOT NULL,
	"veri_attempt_time" timestamp,
	"token" varchar NOT NULL,
	CONSTRAINT "token_setup_authenticator_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_setup_sms_veri" (
	"user_id" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	"send_count" smallint NOT NULL,
	"send_time" timestamp NOT NULL,
	"veri_attempt_count" smallint NOT NULL,
	"veri_attempt_time" timestamp,
	"token" varchar NOT NULL,
	"phone_number" varchar NOT NULL,
	CONSTRAINT "token_setup_sms_veri_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "token_sms_veri" (
	"user_id" varchar NOT NULL,
	"expires" timestamp NOT NULL,
	"send_count" smallint NOT NULL,
	"send_time" timestamp NOT NULL,
	"veri_attempt_count" smallint NOT NULL,
	"veri_attempt_time" timestamp,
	"token" varchar NOT NULL,
	CONSTRAINT "token_sms_veri_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "user_account" ADD COLUMN "email" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user_account" ADD COLUMN "given_name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user_account" ADD COLUMN "family_name" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "user_account" ADD COLUMN "joined_on" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user_account" ADD COLUMN "avatar" jsonb;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_provider" ADD CONSTRAINT "auth_provider_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_email_veri" ADD CONSTRAINT "token_email_veri_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_passkey_challenge" ADD CONSTRAINT "token_passkey_challenge_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_pw_reset" ADD CONSTRAINT "token_pw_reset_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_setup_authenticator" ADD CONSTRAINT "token_setup_authenticator_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_setup_sms_veri" ADD CONSTRAINT "token_setup_sms_veri_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "token_sms_veri" ADD CONSTRAINT "token_sms_veri_user_id_user_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
