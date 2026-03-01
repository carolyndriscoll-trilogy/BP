CREATE TABLE "builder_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"brainlift_id" integer NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"suggested_origin" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builder_facts" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"brainlift_id" integer NOT NULL,
	"text" text NOT NULL,
	"sequence_id" integer DEFAULT 0 NOT NULL,
	"verification_status" text DEFAULT 'pending',
	"verification_score" integer,
	"confidence" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builder_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"brainlift_id" integer NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"discussion_status" text DEFAULT 'not_started',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "builder_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_id" integer NOT NULL,
	"brainlift_id" integer NOT NULL,
	"text" text NOT NULL,
	"related_fact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"grade" integer,
	"grading_dimensions" jsonb,
	"spov_alignment_tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "builder_categories" ADD CONSTRAINT "builder_categories_brainlift_id_brainlifts_id_fk" FOREIGN KEY ("brainlift_id") REFERENCES "public"."brainlifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builder_facts" ADD CONSTRAINT "builder_facts_source_id_builder_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."builder_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builder_facts" ADD CONSTRAINT "builder_facts_brainlift_id_brainlifts_id_fk" FOREIGN KEY ("brainlift_id") REFERENCES "public"."brainlifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builder_sources" ADD CONSTRAINT "builder_sources_category_id_builder_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."builder_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builder_sources" ADD CONSTRAINT "builder_sources_brainlift_id_brainlifts_id_fk" FOREIGN KEY ("brainlift_id") REFERENCES "public"."brainlifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builder_summaries" ADD CONSTRAINT "builder_summaries_source_id_builder_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."builder_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "builder_summaries" ADD CONSTRAINT "builder_summaries_brainlift_id_brainlifts_id_fk" FOREIGN KEY ("brainlift_id") REFERENCES "public"."brainlifts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_builder_categories_brainlift" ON "builder_categories" USING btree ("brainlift_id");--> statement-breakpoint
CREATE INDEX "idx_builder_facts_source" ON "builder_facts" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_builder_facts_brainlift" ON "builder_facts" USING btree ("brainlift_id");--> statement-breakpoint
CREATE INDEX "idx_builder_sources_category" ON "builder_sources" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_builder_sources_brainlift" ON "builder_sources" USING btree ("brainlift_id");--> statement-breakpoint
CREATE INDEX "idx_builder_summaries_source" ON "builder_summaries" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "idx_builder_summaries_brainlift" ON "builder_summaries" USING btree ("brainlift_id");
