CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "achievements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"event" text NOT NULL,
	"properties" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_invites" (
	"id" text PRIMARY KEY NOT NULL,
	"activity_id" text NOT NULL,
	"inviter_user_id" text NOT NULL,
	"invitee_user_id" text,
	"invitee_email" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"challengeId" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"reward" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "challenges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "comparisons" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"friendUserId" text NOT NULL,
	"visibility" text DEFAULT 'private' NOT NULL,
	"snapshot" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"purpose" text NOT NULL,
	"source" text,
	"granted" boolean DEFAULT false NOT NULL,
	"version" text DEFAULT '1.0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"sourceId" text NOT NULL,
	"status" text DEFAULT 'connected' NOT NULL,
	"providerAccountId" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"connectionId" text,
	"name" text NOT NULL,
	"kind" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experiments" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"targetDays" integer DEFAULT 7 NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "feature_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"datasetId" text,
	"features" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"friendUserId" text NOT NULL,
	"status" text DEFAULT 'accepted' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"reportId" text,
	"kind" text NOT NULL,
	"content" text NOT NULL,
	"confidence" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"score" integer NOT NULL,
	"archetype" text NOT NULL,
	"dimensions" jsonb NOT NULL,
	"rawFeatures" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"scoreVersion" text DEFAULT '1.0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "life_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"reportId" text,
	"overall" integer NOT NULL,
	"dimensions" jsonb NOT NULL,
	"scoreVersion" text DEFAULT '1.0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"bio" text,
	"timezone" text,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"reportId" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"source" text,
	"confidence" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "share_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"shareCode" text,
	"referrerUserId" text,
	"referralCode" text,
	"source" text,
	"campaign" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shares" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"reportId" text,
	"code" text NOT NULL,
	"visibility" text DEFAULT 'limited' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shares_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "source_sync_events" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"connectionId" text NOT NULL,
	"status" text NOT NULL,
	"recordsAnalyzed" integer DEFAULT 0 NOT NULL,
	"errorMessage" text,
	"syncedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_plans" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"stripeCustomerId" text,
	"stripeSubscriptionId" text,
	"currentPeriodEnd" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_plans_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"profile_visibility" text DEFAULT 'private' NOT NULL,
	"score_sharing" boolean DEFAULT false NOT NULL,
	"archetype_sharing" boolean DEFAULT false NOT NULL,
	"dimensions_sharing" boolean DEFAULT false NOT NULL,
	"feed_sharing" boolean DEFAULT false NOT NULL,
	"comparison_sharing" boolean DEFAULT false NOT NULL,
	"weekly_pulse_reminders" boolean DEFAULT true NOT NULL,
	"report_ready_notifications" boolean DEFAULT true NOT NULL,
	"sync_failure_notifications" boolean DEFAULT true NOT NULL,
	"challenge_reminders" boolean DEFAULT true NOT NULL,
	"social_notifications" boolean DEFAULT true NOT NULL,
	"marketing_notifications" boolean DEFAULT false NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"in_app_notifications" boolean DEFAULT true NOT NULL,
	"quiet_hours_start" text DEFAULT '22:00' NOT NULL,
	"quiet_hours_end" text DEFAULT '08:00' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "weekly_pulses" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"week" text NOT NULL,
	"mood" integer,
	"energy" integer,
	"focus" integer,
	"reflection" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
