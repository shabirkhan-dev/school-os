CREATE TYPE "homework_status" AS ENUM ('draft', 'published', 'closed');
--> statement-breakpoint
CREATE TYPE "assessment_type" AS ENUM ('quiz', 'test', 'exam');
--> statement-breakpoint
CREATE TYPE "assessment_status" AS ENUM ('draft', 'published', 'closed');
--> statement-breakpoint
CREATE TYPE "assessment_result_status" AS ENUM ('pending', 'graded', 'absent');
--> statement-breakpoint
CREATE TABLE "homework_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"section_subject_id" uuid NOT NULL REFERENCES "section_subjects"("id") ON DELETE CASCADE,
	"title" varchar(200) NOT NULL,
	"description" text,
	"due_at" timestamp with time zone,
	"status" "homework_status" NOT NULL DEFAULT 'draft',
	"created_by_membership_id" uuid NOT NULL REFERENCES "memberships"("id") ON DELETE RESTRICT,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "homework_assignments_tenant_id_idx" ON "homework_assignments" ("tenant_id");
--> statement-breakpoint
CREATE INDEX "homework_assignments_section_subject_id_idx" ON "homework_assignments" ("section_subject_id");
--> statement-breakpoint
CREATE INDEX "homework_assignments_due_at_idx" ON "homework_assignments" ("tenant_id", "due_at");
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"section_subject_id" uuid NOT NULL REFERENCES "section_subjects"("id") ON DELETE CASCADE,
	"type" "assessment_type" NOT NULL DEFAULT 'test',
	"title" varchar(200) NOT NULL,
	"assessed_on" date NOT NULL,
	"max_score" numeric(8, 2) NOT NULL DEFAULT 100,
	"status" "assessment_status" NOT NULL DEFAULT 'draft',
	"created_by_membership_id" uuid NOT NULL REFERENCES "memberships"("id") ON DELETE RESTRICT,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "assessments_tenant_id_idx" ON "assessments" ("tenant_id");
--> statement-breakpoint
CREATE INDEX "assessments_section_subject_id_idx" ON "assessments" ("section_subject_id");
--> statement-breakpoint
CREATE INDEX "assessments_assessed_on_idx" ON "assessments" ("tenant_id", "assessed_on");
--> statement-breakpoint
CREATE TABLE "assessment_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"assessment_id" uuid NOT NULL REFERENCES "assessments"("id") ON DELETE CASCADE,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
	"score" numeric(8, 2),
	"status" "assessment_result_status" NOT NULL DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "assessment_results_assessment_student_unique" ON "assessment_results" ("assessment_id", "student_id");
--> statement-breakpoint
CREATE INDEX "assessment_results_tenant_id_idx" ON "assessment_results" ("tenant_id");
--> statement-breakpoint
INSERT INTO "permissions" ("code", "module", "description") VALUES
	('homework.read', 'homework', 'View homework assignments for assigned classes'),
	('homework.write', 'homework', 'Create and update homework assignments'),
	('assessments.read', 'assessments', 'View tests, quizzes, and grade entries'),
	('assessments.write', 'assessments', 'Create assessments and enter grades')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code IN ('owner', 'principal', 'admin')
	AND p.code IN ('homework.read', 'homework.write', 'assessments.read', 'assessments.write')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code = 'teacher'
	AND p.code IN ('homework.read', 'homework.write', 'assessments.read', 'assessments.write')
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "navigation_items" ("key", "label", "href", "icon_key", "section_heading", "required_permission", "visible_to_roles", "sort_order", "is_enabled")
VALUES
	('homework', 'Homework', '/admin/homework', 'homework', 'Main Menu', 'homework.read', NULL, 45, true)
ON CONFLICT ("surface", "key") DO UPDATE
SET
	"label" = EXCLUDED."label",
	"href" = EXCLUDED."href",
	"icon_key" = EXCLUDED."icon_key",
	"required_permission" = EXCLUDED."required_permission",
	"visible_to_roles" = EXCLUDED."visible_to_roles",
	"sort_order" = EXCLUDED."sort_order",
	"is_enabled" = EXCLUDED."is_enabled";
--> statement-breakpoint
UPDATE "navigation_items"
SET
	"label" = 'Tests & exams',
	"href" = '/admin/assessments',
	"required_permission" = 'assessments.read',
	"sort_order" = 50,
	"is_enabled" = true,
	"visible_to_roles" = NULL
WHERE "key" = 'exams' AND "surface" = 'admin';
