CREATE TYPE "navigation_surface" AS ENUM ('admin');

CREATE TABLE "navigation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"label" varchar(128) NOT NULL,
	"href" varchar(255),
	"icon_key" varchar(64),
	"section_heading" varchar(64) NOT NULL,
	"parent_id" uuid,
	"required_permission" varchar(128),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"surface" "navigation_surface" DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "navigation_items"
ADD CONSTRAINT "navigation_items_parent_id_navigation_items_id_fk"
FOREIGN KEY ("parent_id") REFERENCES "navigation_items"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

CREATE UNIQUE INDEX "navigation_items_surface_key_unique" ON "navigation_items" ("surface", "key");
CREATE INDEX "navigation_items_surface_idx" ON "navigation_items" ("surface");
CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" ("parent_id");
CREATE INDEX "navigation_items_section_sort_idx" ON "navigation_items" ("section_heading", "sort_order");

INSERT INTO "navigation_items" ("key", "label", "href", "icon_key", "section_heading", "required_permission", "sort_order", "is_enabled") VALUES
	('dashboard', 'Dashboard', '/admin', 'dashboard', 'Main Menu', NULL, 10, true),
	('ai-assist', 'AI Assist', '/admin/ai', 'ai-assist', 'Main Menu', NULL, 20, true),
	('attendance', 'Attendance', '/admin/attendance', 'attendance', 'Main Menu', 'attendance.read', 30, true),
	('timetable', 'Timetable', NULL, 'calendar', 'Main Menu', 'academic.read', 40, false),
	('exams', 'Exams', NULL, 'file', 'Main Menu', 'academic.read', 50, false),
	('announcements', 'Announcements', NULL, 'megaphone', 'Main Menu', NULL, 60, false),
	('students', 'Students', '/admin/students', 'student', 'People', 'students.read', 10, true),
	('members', 'Members', '/admin/members', 'user-multiple', 'People', 'tenant.membership.read', 20, true),
	('teachers', 'Teachers', NULL, 'teacher', 'People', 'tenant.membership.read', 30, false),
	('guardians', 'Guardians', NULL, 'user-multiple', 'People', 'students.read', 40, false),
	('admissions', 'Admissions', NULL, 'user-add', 'Management', NULL, 10, false),
	('fees', 'Fees & Invoices', NULL, 'invoice', 'Management', NULL, 20, false),
	('academics', 'Academics', '/admin/academics', 'mortarboard', 'Management', 'academic.read', 30, true),
	('roles', 'Roles & Permissions', NULL, 'user-settings', 'Management', 'tenant.membership.manage', 40, false),
	('integrations', 'Integrations', NULL, 'puzzle', 'Management', 'tenant.settings.write', 50, false),
	('help', 'Help Center', NULL, 'help', 'Settings', NULL, 10, false),
	('system', 'System Settings', NULL, 'settings', 'Settings', 'tenant.settings.write', 20, false),
	('organization', 'Organization', '/admin/organization', 'building', 'Settings', 'tenant.settings.read', 30, true),
	('account-profile', 'Profile', '/admin/account/profile', 'user-circle', 'Settings', NULL, 40, true),
	('account-security', 'Account Security', '/admin/account/security', 'security', 'Settings', NULL, 50, true);

INSERT INTO "navigation_items" ("key", "label", "href", "icon_key", "section_heading", "parent_id", "required_permission", "sort_order", "is_enabled")
SELECT
	'academics-years',
	'Academic years',
	'/admin/academics/years',
	'calendar',
	'Management',
	parent.id,
	'academic.read',
	31,
	true
FROM "navigation_items" AS parent
WHERE parent."key" = 'academics' AND parent."surface" = 'admin';

INSERT INTO "navigation_items" ("key", "label", "href", "icon_key", "section_heading", "parent_id", "required_permission", "sort_order", "is_enabled")
SELECT
	'academics-grades',
	'Grades',
	'/admin/academics/grades',
	'layers',
	'Management',
	parent.id,
	'academic.read',
	32,
	true
FROM "navigation_items" AS parent
WHERE parent."key" = 'academics' AND parent."surface" = 'admin';

INSERT INTO "navigation_items" ("key", "label", "href", "icon_key", "section_heading", "parent_id", "required_permission", "sort_order", "is_enabled")
SELECT
	'academics-sections',
	'Sections',
	'/admin/academics/sections',
	'grid',
	'Management',
	parent.id,
	'academic.read',
	33,
	true
FROM "navigation_items" AS parent
WHERE parent."key" = 'academics' AND parent."surface" = 'admin';
