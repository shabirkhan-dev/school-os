-- Vice-principal membership role (same platform permissions as principal)
ALTER TYPE "public"."membership_role" ADD VALUE IF NOT EXISTS 'vice_principal';--> statement-breakpoint

INSERT INTO "roles" ("tenant_id", "code", "name", "description")
SELECT NULL, 'vice_principal', 'Vice Principal', 'Deputy school leadership — operations and academic oversight'
WHERE NOT EXISTS (
	SELECT 1 FROM "roles" r WHERE r.tenant_id IS NULL AND r.code = 'vice_principal'
);--> statement-breakpoint

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT vp.id, rp.permission_id
FROM "roles" vp
INNER JOIN "roles" p ON p.tenant_id IS NULL AND p.code = 'principal'
INNER JOIN "role_permissions" rp ON rp.role_id = p.id
WHERE vp.tenant_id IS NULL AND vp.code = 'vice_principal'
ON CONFLICT DO NOTHING;--> statement-breakpoint

UPDATE "navigation_items"
SET "visible_to_roles" = array_append("visible_to_roles", 'vice_principal')
WHERE 'principal' = ANY("visible_to_roles")
	AND NOT ('vice_principal' = ANY("visible_to_roles"));
