CREATE TABLE "clearity-t3-reloaded_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "clearity-t3-reloaded_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "clearity-t3-reloaded_eve_character" (
	"id" serial PRIMARY KEY NOT NULL,
	"characterId" bigint NOT NULL,
	"characterName" varchar(255) NOT NULL,
	"corporationId" bigint,
	"corporationName" varchar(255),
	"allianceId" bigint,
	"allianceName" varchar(255),
	"portraitUrl" varchar(512),
	"provider" varchar(255) DEFAULT 'eveonline' NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"userId" varchar(255) NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "clearity-t3-reloaded_eve_character_characterId_unique" UNIQUE("characterId")
);
--> statement-breakpoint
CREATE TABLE "clearity-t3-reloaded_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clearity-t3-reloaded_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"password" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "clearity-t3-reloaded_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "clearity-t3-reloaded_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "clearity-t3-reloaded_account" ADD CONSTRAINT "clearity-t3-reloaded_account_userId_clearity-t3-reloaded_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."clearity-t3-reloaded_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clearity-t3-reloaded_eve_character" ADD CONSTRAINT "clearity-t3-reloaded_eve_character_userId_clearity-t3-reloaded_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."clearity-t3-reloaded_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clearity-t3-reloaded_eve_character" ADD CONSTRAINT "clearity-t3-reloaded_eve_character_provider_providerAccountId_clearity-t3-reloaded_account_provider_providerAccountId_fk" FOREIGN KEY ("provider","providerAccountId") REFERENCES "public"."clearity-t3-reloaded_account"("provider","providerAccountId") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clearity-t3-reloaded_session" ADD CONSTRAINT "clearity-t3-reloaded_session_userId_clearity-t3-reloaded_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."clearity-t3-reloaded_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "clearity-t3-reloaded_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "eve_character_user_id_idx" ON "clearity-t3-reloaded_eve_character" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "eve_character_character_id_idx" ON "clearity-t3-reloaded_eve_character" USING btree ("characterId");--> statement-breakpoint
CREATE INDEX "t_user_id_idx" ON "clearity-t3-reloaded_session" USING btree ("userId");