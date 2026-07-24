CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(128) NOT NULL,
	"module" varchar(64) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "permissions_code_unique" ON "permissions" ("code");
CREATE INDEX "permissions_module_idx" ON "permissions" ("module");

CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid REFERENCES "tenants"("id") ON DELETE CASCADE,
	"code" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "roles_tenant_id_idx" ON "roles" ("tenant_id");
CREATE INDEX "roles_code_idx" ON "roles" ("code");
CREATE UNIQUE INDEX "roles_platform_code_unique" ON "roles" ("code") WHERE "tenant_id" IS NULL;
CREATE UNIQUE INDEX "roles_tenant_code_unique" ON "roles" ("tenant_id", "code") WHERE "tenant_id" IS NOT NULL;

CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
	"permission_id" uuid NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);

INSERT INTO "permissions" ("code", "module", "description") VALUES
	('tenant.settings.read', 'tenant', 'View organization settings and campuses'),
	('tenant.settings.write', 'tenant', 'Update organization settings'),
	('tenant.campus.create', 'tenant', 'Create campuses under the organization'),
	('tenant.campus.update', 'tenant', 'Update campuses under the organization')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "roles" ("tenant_id", "code", "name", "description")
SELECT NULL, v.code, v.name, v.description
FROM (
	VALUES
		('owner', 'Owner', 'Full organization access across all campuses'),
		('principal', 'Principal', 'Campus leadership and operational oversight'),
		('admin', 'Admin', 'Campus or tenant administration'),
		('teacher', 'Teacher', 'Assigned sections and classroom workflows'),
		('parent', 'Parent', 'Linked student visibility and communication'),
		('student', 'Student', 'Self-service student access')
) AS v(code, name, description)
WHERE NOT EXISTS (
	SELECT 1 FROM "roles" r WHERE r.tenant_id IS NULL AND r.code = v.code
);

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code = 'owner'
	AND p.code IN (
		'tenant.settings.read',
		'tenant.settings.write',
		'tenant.campus.create',
		'tenant.campus.update'
	)
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code IN ('principal', 'admin')
	AND p.code IN (
		'tenant.settings.read',
		'tenant.settings.write',
		'tenant.campus.create',
		'tenant.campus.update'
	)
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code IN ('teacher', 'parent', 'student')
	AND p.code = 'tenant.settings.read'
ON CONFLICT DO NOTHING;
