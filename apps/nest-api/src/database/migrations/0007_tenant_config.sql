CREATE TABLE "tenant_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"academic_year_start_month" smallint DEFAULT 4 NOT NULL,
	"attendance_grace_minutes" integer DEFAULT 15 NOT NULL,
	"quiet_hours_start" time DEFAULT '22:00:00' NOT NULL,
	"quiet_hours_end" time DEFAULT '07:00:00' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_settings_tenant_id_unique" UNIQUE("tenant_id")
);

CREATE INDEX "tenant_settings_tenant_id_idx" ON "tenant_settings" ("tenant_id");

CREATE TABLE "tenant_branding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"display_name_en" varchar(200),
	"display_name_ur" varchar(200),
	"logo_url" text,
	"primary_color" varchar(7),
	"accent_color" varchar(7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_branding_tenant_id_unique" UNIQUE("tenant_id")
);

CREATE INDEX "tenant_branding_tenant_id_idx" ON "tenant_branding" ("tenant_id");

CREATE TABLE "tenant_communication_policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"whatsapp_enabled" boolean DEFAULT true NOT NULL,
	"sms_fallback_enabled" boolean DEFAULT true NOT NULL,
	"email_fallback_enabled" boolean DEFAULT true NOT NULL,
	"notify_all_guardians" boolean DEFAULT false NOT NULL,
	"sick_report_requires_note" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_communication_policies_tenant_id_unique" UNIQUE("tenant_id")
);

CREATE INDEX "tenant_communication_policies_tenant_id_idx" ON "tenant_communication_policies" ("tenant_id");

INSERT INTO "tenant_settings" ("tenant_id")
SELECT t.id FROM "tenants" t
WHERE NOT EXISTS (
	SELECT 1 FROM "tenant_settings" ts WHERE ts."tenant_id" = t.id
);

INSERT INTO "tenant_branding" ("tenant_id", "display_name_en")
SELECT t.id, t.name FROM "tenants" t
WHERE NOT EXISTS (
	SELECT 1 FROM "tenant_branding" tb WHERE tb."tenant_id" = t.id
);

INSERT INTO "tenant_communication_policies" ("tenant_id")
SELECT t.id FROM "tenants" t
WHERE NOT EXISTS (
	SELECT 1 FROM "tenant_communication_policies" tcp WHERE tcp."tenant_id" = t.id
);
