CREATE TYPE "guardian_relationship" AS ENUM (
	'father',
	'mother',
	'guardian',
	'step_parent',
	'grandparent',
	'sibling',
	'other'
);

CREATE TYPE "guardian_preferred_channel" AS ENUM ('email', 'phone', 'whatsapp', 'sms');

CREATE TYPE "staff_status" AS ENUM ('active', 'inactive', 'on_leave');

CREATE TABLE "membership_roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" uuid NOT NULL,
	"role" "membership_role" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "membership_roles"
ADD CONSTRAINT "membership_roles_membership_id_memberships_id_fk"
FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "membership_roles_membership_role_unique" ON "membership_roles" ("membership_id", "role");
CREATE INDEX "membership_roles_membership_id_idx" ON "membership_roles" ("membership_id");

INSERT INTO "membership_roles" ("membership_id", "role")
SELECT m.id, m.role FROM "memberships" m;

CREATE TABLE "staff_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"membership_id" uuid NOT NULL,
	"employee_code" varchar(32),
	"phone" varchar(32),
	"qualification" varchar(255),
	"specialization" varchar(255),
	"hire_date" date,
	"status" "staff_status" DEFAULT 'active' NOT NULL,
	"notes" text,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "staff_profiles"
ADD CONSTRAINT "staff_profiles_tenant_id_tenants_id_fk"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "staff_profiles"
ADD CONSTRAINT "staff_profiles_membership_id_memberships_id_fk"
FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "staff_profiles_membership_unique" ON "staff_profiles" ("membership_id");
CREATE UNIQUE INDEX "staff_profiles_tenant_employee_code_unique" ON "staff_profiles" ("tenant_id", "employee_code");
CREATE INDEX "staff_profiles_tenant_id_idx" ON "staff_profiles" ("tenant_id");

CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" varchar(255),
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "subjects"
ADD CONSTRAINT "subjects_tenant_id_tenants_id_fk"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "subjects_tenant_code_unique" ON "subjects" ("tenant_id", "code");
CREATE INDEX "subjects_tenant_id_idx" ON "subjects" ("tenant_id");

CREATE TABLE "section_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"teacher_membership_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "section_subjects"
ADD CONSTRAINT "section_subjects_tenant_id_tenants_id_fk"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "section_subjects"
ADD CONSTRAINT "section_subjects_section_id_sections_id_fk"
FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "section_subjects"
ADD CONSTRAINT "section_subjects_subject_id_subjects_id_fk"
FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "section_subjects"
ADD CONSTRAINT "section_subjects_teacher_membership_id_memberships_id_fk"
FOREIGN KEY ("teacher_membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "section_subjects_section_subject_unique" ON "section_subjects" ("section_id", "subject_id");
CREATE INDEX "section_subjects_tenant_id_idx" ON "section_subjects" ("tenant_id");
CREATE INDEX "section_subjects_teacher_membership_id_idx" ON "section_subjects" ("teacher_membership_id");

CREATE TABLE "guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"membership_id" uuid,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255),
	"phone" varchar(32),
	"alternate_phone" varchar(32),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100),
	"occupation" varchar(128),
	"preferred_channel" "guardian_preferred_channel" DEFAULT 'phone' NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "guardians"
ADD CONSTRAINT "guardians_tenant_id_tenants_id_fk"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "guardians"
ADD CONSTRAINT "guardians_membership_id_memberships_id_fk"
FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

CREATE INDEX "guardians_tenant_id_idx" ON "guardians" ("tenant_id");
CREATE INDEX "guardians_membership_id_idx" ON "guardians" ("membership_id");

CREATE TABLE "student_guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"guardian_id" uuid NOT NULL,
	"relationship" "guardian_relationship" NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"can_pickup" boolean DEFAULT true NOT NULL,
	"receives_notifications" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "student_guardians"
ADD CONSTRAINT "student_guardians_tenant_id_tenants_id_fk"
FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "student_guardians"
ADD CONSTRAINT "student_guardians_student_id_students_id_fk"
FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "student_guardians"
ADD CONSTRAINT "student_guardians_guardian_id_guardians_id_fk"
FOREIGN KEY ("guardian_id") REFERENCES "guardians"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "student_guardians_student_guardian_unique" ON "student_guardians" ("student_id", "guardian_id");
CREATE INDEX "student_guardians_tenant_id_idx" ON "student_guardians" ("tenant_id");
CREATE INDEX "student_guardians_guardian_id_idx" ON "student_guardians" ("guardian_id");

ALTER TABLE "students" ADD COLUMN "middle_name" varchar(100);
ALTER TABLE "students" ADD COLUMN "email" varchar(255);
ALTER TABLE "students" ADD COLUMN "phone" varchar(32);
ALTER TABLE "students" ADD COLUMN "address_line1" varchar(255);
ALTER TABLE "students" ADD COLUMN "address_line2" varchar(255);
ALTER TABLE "students" ADD COLUMN "city" varchar(100);
ALTER TABLE "students" ADD COLUMN "state" varchar(100);
ALTER TABLE "students" ADD COLUMN "postal_code" varchar(20);
ALTER TABLE "students" ADD COLUMN "country" varchar(100);
ALTER TABLE "students" ADD COLUMN "blood_group" varchar(8);
ALTER TABLE "students" ADD COLUMN "medical_notes" text;
ALTER TABLE "students" ADD COLUMN "emergency_contact_name" varchar(200);
ALTER TABLE "students" ADD COLUMN "emergency_contact_phone" varchar(32);
ALTER TABLE "students" ADD COLUMN "admitted_on" date;
ALTER TABLE "students" ADD COLUMN "previous_school" varchar(255);

ALTER TABLE "navigation_items" ADD COLUMN "visible_to_roles" text[];

INSERT INTO "permissions" ("code", "module", "description") VALUES
	('staff.read', 'staff', 'View teacher and staff profiles'),
	('staff.write', 'staff', 'Create and update teacher profiles and assignments'),
	('guardians.read', 'guardians', 'View student guardians and guardian contacts'),
	('guardians.write', 'guardians', 'Create and update guardians and student-guardian links');

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code IN ('owner', 'principal', 'admin')
	AND p.code IN ('staff.read', 'staff.write', 'guardians.read', 'guardians.write');

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
JOIN "permissions" p ON p.code IN ('staff.read', 'guardians.read')
WHERE r.tenant_id IS NULL AND r.code = 'teacher';

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
JOIN "permissions" p ON p.code = 'guardians.read'
WHERE r.tenant_id IS NULL AND r.code = 'parent';

UPDATE "navigation_items"
SET
	"href" = '/admin/teachers',
	"is_enabled" = true,
	"required_permission" = 'staff.read'
WHERE "key" = 'teachers' AND "surface" = 'admin';

UPDATE "navigation_items"
SET
	"href" = '/admin/guardians',
	"is_enabled" = true,
	"required_permission" = 'guardians.read'
WHERE "key" = 'guardians' AND "surface" = 'admin';

INSERT INTO "navigation_items" ("key", "label", "href", "icon_key", "section_heading", "required_permission", "visible_to_roles", "sort_order", "is_enabled") VALUES
	('my-classes', 'My classes', '/admin/my-classes', 'teacher', 'Main Menu', 'academic.read', ARRAY['teacher'], 35, true),
	('my-children', 'My children', '/admin/my-children', 'student', 'Main Menu', 'guardians.read', ARRAY['parent'], 36, true);
