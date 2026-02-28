CREATE TYPE "public"."gender_type" AS ENUM('laki-laki', 'perempuan');--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_name" varchar(255) NOT NULL,
	"id_attendance" varchar(100),
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"kelurahan" varchar(100) NOT NULL,
	"kecamatan" varchar(100) NOT NULL,
	"kota" varchar(100) NOT NULL,
	"provinsi" varchar(100) NOT NULL,
	"academic" varchar(255),
	"gender" "gender_type",
	"email" varchar(255),
	"phone" varchar(50),
	"birthday" date,
	"joindate" date,
	"exitdate" date,
	"picture" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
