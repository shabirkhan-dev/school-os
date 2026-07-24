CREATE TYPE "membership_invite_status" AS ENUM ('pending', 'accepted', 'revoked', 'expired');

CREATE TABLE "membership_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"email" varchar(320) NOT NULL,
	"role" "membership_role" NOT NULL,
	"campus_id" uuid REFERENCES "campuses"("id") ON DELETE SET NULL,
	"invited_by_membership_id" uuid REFERENCES "memberships"("id") ON DELETE SET NULL,
	"membership_id" uuid REFERENCES "memberships"("id") ON DELETE SET NULL,
	"token_hash" varchar(128) NOT NULL,
	"status" "membership_invite_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "membership_invites_token_hash_unique" ON "membership_invites" ("token_hash");
CREATE INDEX "membership_invites_tenant_id_idx" ON "membership_invites" ("tenant_id");
CREATE INDEX "membership_invites_email_idx" ON "membership_invites" ("email");
CREATE INDEX "membership_invites_status_idx" ON "membership_invites" ("status");

CREATE UNIQUE INDEX "membership_invites_pending_tenant_email_unique" ON "membership_invites" ("tenant_id", "email")
WHERE "status" = 'pending';

INSERT INTO "permissions" ("code", "module", "description") VALUES
	('tenant.membership.read', 'tenant', 'View organization members and pending invites'),
	('tenant.membership.invite', 'tenant', 'Invite users to the organization'),
	('tenant.membership.manage', 'tenant', 'Update member roles and membership status')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code IN ('owner', 'principal', 'admin')
	AND p.code IN ('tenant.membership.read', 'tenant.membership.invite', 'tenant.membership.manage')
ON CONFLICT DO NOTHING;
