-- Teacher sidebar: only show routes teachers can use (management items are role-gated).

UPDATE "navigation_items"
SET "visible_to_roles" = ARRAY['owner', 'principal', 'admin']
WHERE "key" IN (
	'students',
	'members',
	'teachers',
	'guardians',
	'organization',
	'academics',
	'academics-years',
	'academics-grades',
	'academics-sections',
	'ai-assist'
)
AND "surface" = 'admin';

UPDATE "navigation_items"
SET
	"required_permission" = 'staff.write',
	"visible_to_roles" = ARRAY['owner', 'principal', 'admin']
WHERE "key" = 'teachers' AND "surface" = 'admin';

INSERT INTO "navigation_items" ("key", "label", "href", "icon_key", "section_heading", "required_permission", "visible_to_roles", "sort_order", "is_enabled")
VALUES
	('teacher-profile', 'Teaching profile', '/admin/account/teacher', 'teacher', 'Settings', 'staff.read', ARRAY['teacher'], 35, true)
ON CONFLICT ("surface", "key") DO UPDATE
SET
	"label" = EXCLUDED."label",
	"href" = EXCLUDED."href",
	"icon_key" = EXCLUDED."icon_key",
	"required_permission" = EXCLUDED."required_permission",
	"visible_to_roles" = EXCLUDED."visible_to_roles",
	"sort_order" = EXCLUDED."sort_order",
	"is_enabled" = EXCLUDED."is_enabled";

UPDATE "navigation_items"
SET
	"sort_order" = 10,
	"visible_to_roles" = NULL
WHERE "key" = 'dashboard' AND "surface" = 'admin';

UPDATE "navigation_items"
SET
	"section_heading" = 'Main Menu',
	"sort_order" = 25,
	"visible_to_roles" = ARRAY['teacher']
WHERE "key" = 'my-classes' AND "surface" = 'admin';

UPDATE "navigation_items"
SET
	"sort_order" = 30,
	"visible_to_roles" = NULL,
	"required_permission" = 'attendance.read'
WHERE "key" = 'attendance' AND "surface" = 'admin';

UPDATE "navigation_items"
SET
	"sort_order" = CASE "key"
		WHEN 'teacher-profile' THEN 35
		WHEN 'account-profile' THEN 40
		WHEN 'account-security' THEN 50
		ELSE "sort_order"
	END
WHERE "key" IN ('teacher-profile', 'account-profile', 'account-security')
AND "surface" = 'admin';
