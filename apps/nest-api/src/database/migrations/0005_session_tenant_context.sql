ALTER TABLE "sessions"
ADD COLUMN "active_tenant_id" uuid REFERENCES "tenants"("id") ON DELETE SET NULL;

ALTER TABLE "sessions"
ADD COLUMN "active_membership_id" uuid REFERENCES "memberships"("id") ON DELETE SET NULL;

CREATE INDEX "sessions_active_tenant_id_idx" ON "sessions" ("active_tenant_id");
