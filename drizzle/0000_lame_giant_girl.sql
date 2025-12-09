CREATE TABLE "courses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "courses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"cid" varchar NOT NULL,
	"name" varchar,
	"description" varchar,
	"chapter" integer NOT NULL,
	"includevideo" boolean DEFAULT false,
	"category" varchar,
	"level" varchar NOT NULL,
	"courseJson" json,
	"coursecontent" json,
	"userEmail" varchar NOT NULL,
	"bannerImageurl" varchar DEFAULT '',
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"SubscriptId" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_userEmail_users_email_fk" FOREIGN KEY ("userEmail") REFERENCES "public"."users"("email") ON DELETE no action ON UPDATE no action;