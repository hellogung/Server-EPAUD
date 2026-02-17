CREATE TYPE "public"."accreditation" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."school_category" AS ENUM('sps', 'tk', 'kb');--> statement-breakpoint
CREATE TYPE "public"."school_type" AS ENUM('negeri', 'swasta');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "full_name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "token" SET DATA TYPE varchar(500);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_code" varchar(6);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_expires" timestamp;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "school_type" "school_type";--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "school_category" "school_category";--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "npsn" varchar(20);--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "accreditation" "accreditation";--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_npsn_unique" UNIQUE("npsn");