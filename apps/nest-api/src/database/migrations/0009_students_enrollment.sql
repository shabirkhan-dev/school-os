CREATE TYPE "student_status" AS ENUM ('active', 'inactive', 'graduated', 'withdrawn');
CREATE TYPE "student_gender" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE "enrollment_status" AS ENUM ('active', 'transferred', 'withdrawn');

CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"campus_id" uuid NOT NULL REFERENCES "campuses"("id") ON DELETE CASCADE,
	"student_code" varchar(32) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"date_of_birth" date,
	"gender" "student_gender",
	"status" "student_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "students_tenant_code_unique" ON "students" ("tenant_id", "student_code");
CREATE INDEX "students_tenant_id_idx" ON "students" ("tenant_id");
CREATE INDEX "students_campus_id_idx" ON "students" ("campus_id");
CREATE INDEX "students_status_idx" ON "students" ("status");

CREATE TABLE "enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
	"section_id" uuid NOT NULL REFERENCES "sections"("id") ON DELETE CASCADE,
	"academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE CASCADE,
	"status" "enrollment_status" DEFAULT 'active' NOT NULL,
	"enrolled_on" date DEFAULT CURRENT_DATE NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "enrollments_one_active_per_student_year" ON "enrollments" ("tenant_id", "student_id", "academic_year_id") WHERE "status" = 'active' AND "deleted_at" IS NULL;
CREATE INDEX "enrollments_tenant_id_idx" ON "enrollments" ("tenant_id");
CREATE INDEX "enrollments_student_id_idx" ON "enrollments" ("student_id");
CREATE INDEX "enrollments_section_id_idx" ON "enrollments" ("section_id");
CREATE INDEX "enrollments_academic_year_id_idx" ON "enrollments" ("academic_year_id");

INSERT INTO "permissions" ("code", "module", "description") VALUES
	('students.read', 'students', 'View student records and enrollments'),
	('students.write', 'students', 'Create and update students and enrollments')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code IN ('owner', 'principal', 'admin')
	AND p.code IN ('students.read', 'students.write')
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code = 'teacher'
	AND p.code = 'students.read'
ON CONFLICT DO NOTHING;
