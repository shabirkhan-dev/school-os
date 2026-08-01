ALTER TABLE "assessment_results"
	ADD COLUMN "total_marks" numeric(8, 2),
	ADD COLUMN "grade" varchar(8),
	ADD COLUMN "remarks" text,
	ADD COLUMN "marked_by" uuid REFERENCES "memberships"("id") ON DELETE SET NULL,
	ADD COLUMN "marked_at" timestamp with time zone;
--> statement-breakpoint
CREATE INDEX "assessment_results_tenant_assessment_idx" ON "assessment_results" ("tenant_id", "assessment_id");
--> statement-breakpoint
CREATE INDEX "assessment_results_tenant_student_idx" ON "assessment_results" ("tenant_id", "student_id");
--> statement-breakpoint
CREATE TYPE "gradebook_term" AS ENUM ('term1', 'term2', 'term3', 'final');
--> statement-breakpoint
CREATE TYPE "gradebook_source" AS ENUM ('assessment', 'homework', 'manual');
--> statement-breakpoint
CREATE TABLE "gradebook_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
	"section_id" uuid NOT NULL REFERENCES "sections"("id") ON DELETE CASCADE,
	"academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE CASCADE,
	"term" "gradebook_term" NOT NULL,
	"subject_id" uuid NOT NULL REFERENCES "subjects"("id") ON DELETE CASCADE,
	"total_marks" numeric(8, 2) DEFAULT '100' NOT NULL,
	"obtained_marks" numeric(8, 2) DEFAULT '0' NOT NULL,
	"grade" varchar(8) DEFAULT 'N' NOT NULL,
	"grade_point" numeric(4, 2) DEFAULT '0' NOT NULL,
	"source" "gradebook_source" DEFAULT 'manual' NOT NULL,
	"source_id" uuid,
	"created_by_membership_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "gradebook_entries_tenant_id_idx" ON "gradebook_entries" ("tenant_id");
--> statement-breakpoint
CREATE INDEX "gradebook_entries_tenant_student_idx" ON "gradebook_entries" ("tenant_id", "student_id");
--> statement-breakpoint
CREATE INDEX "gradebook_entries_tenant_section_year_term_idx" ON "gradebook_entries" ("tenant_id", "section_id", "academic_year_id", "term");
--> statement-breakpoint
CREATE INDEX "gradebook_entries_source_idx" ON "gradebook_entries" ("source", "source_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "gradebook_entries_student_section_term_subject_unique" ON "gradebook_entries" ("student_id", "section_id", "term", "subject_id");
