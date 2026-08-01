CREATE TYPE "homework_submission_status" AS ENUM ('pending', 'submitted', 'late', 'graded', 'excused');
--> statement-breakpoint
CREATE TABLE "homework_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"homework_id" uuid NOT NULL REFERENCES "homework_assignments"("id") ON DELETE CASCADE,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
	"status" "homework_submission_status" NOT NULL DEFAULT 'pending',
	"submitted_at" timestamp with time zone,
	"grade" varchar(16),
	"marks_obtained" numeric(8, 2),
	"total_marks" numeric(8, 2),
	"feedback" text,
	"attachment_url" text,
	"graded_by" uuid REFERENCES "memberships"("id") ON DELETE SET NULL,
	"graded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "homework_submissions_homework_student_unique" ON "homework_submissions" ("homework_id", "student_id");
--> statement-breakpoint
CREATE INDEX "homework_submissions_tenant_homework_idx" ON "homework_submissions" ("tenant_id", "homework_id");
--> statement-breakpoint
CREATE INDEX "homework_submissions_tenant_student_idx" ON "homework_submissions" ("tenant_id", "student_id");
--> statement-breakpoint
CREATE INDEX "homework_submissions_status_idx" ON "homework_submissions" ("status");
