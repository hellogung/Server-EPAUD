CREATE TABLE "user_schools" (
	"user_id" uuid NOT NULL,
	"school_id" uuid NOT NULL,
	"role" varchar(255) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_schools_user_id_school_id_pk" PRIMARY KEY("user_id","school_id")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_school_id_schools_id_fk";
--> statement-breakpoint
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "school_id";