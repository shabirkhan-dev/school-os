CREATE TYPE "academic_year_status" AS ENUM ('draft', 'active', 'archived');
CREATE TYPE "section_status" AS ENUM ('active', 'inactive');

CREATE TABLE "academic_years" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"name" varchar(64) NOT NULL,
	"starts_on" date NOT NULL,
	"ends_on" date NOT NULL,
	"status" "academic_year_status" DEFAULT 'draft' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "academic_years_tenant_name_unique" ON "academic_years" ("tenant_id", "name");
CREATE INDEX "academic_years_tenant_id_idx" ON "academic_years" ("tenant_id");
CREATE INDEX "academic_years_status_idx" ON "academic_years" ("status");
CREATE UNIQUE INDEX "academic_years_one_active_per_tenant" ON "academic_years" ("tenant_id") WHERE "status" = 'active' AND "deleted_at" IS NULL;

CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"name" varchar(120) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "classes_tenant_name_unique" ON "classes" ("tenant_id", "name");
CREATE INDEX "classes_tenant_id_idx" ON "classes" ("tenant_id");

CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"campus_id" uuid NOT NULL REFERENCES "campuses"("id") ON DELETE CASCADE,
	"class_id" uuid NOT NULL REFERENCES "classes"("id") ON DELETE CASCADE,
	"academic_year_id" uuid NOT NULL REFERENCES "academic_years"("id") ON DELETE CASCADE,
	"name" varchar(64) NOT NULL,
	"homeroom_teacher_membership_id" uuid REFERENCES "memberships"("id") ON DELETE SET NULL,
	"status" "section_status" DEFAULT 'active' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "sections_tenant_year_campus_class_name_unique" ON "sections" ("tenant_id", "academic_year_id", "campus_id", "class_id", "name");
CREATE INDEX "sections_tenant_id_idx" ON "sections" ("tenant_id");
CREATE INDEX "sections_campus_id_idx" ON "sections" ("campus_id");
CREATE INDEX "sections_academic_year_id_idx" ON "sections" ("academic_year_id");

INSERT INTO "permissions" ("code", "module", "description") VALUES
	('academic.read', 'academic', 'View academic years, classes, and sections'),
	('academic.write', 'academic', 'Manage academic years, classes, sections, and teacher assignments')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code IN ('owner', 'principal', 'admin')
	AND p.code IN ('academic.read', 'academic.write')
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code = 'teacher'
	AND p.code = 'academic.read'
ON CONFLICT DO NOTHING;
