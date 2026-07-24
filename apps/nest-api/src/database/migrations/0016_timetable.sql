CREATE TYPE "timetable_period_kind" AS ENUM ('period', 'break');

CREATE TABLE "timetable_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"name" varchar(64) NOT NULL,
	"starts_at" time NOT NULL,
	"ends_at" time NOT NULL,
	"kind" "timetable_period_kind" DEFAULT 'period' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "timetable_periods_tenant_name_unique" ON "timetable_periods" ("tenant_id", "name");
CREATE INDEX "timetable_periods_tenant_sort_idx" ON "timetable_periods" ("tenant_id", "sort_order");

CREATE TABLE "timetable_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"campus_id" uuid NOT NULL REFERENCES "campuses"("id") ON DELETE CASCADE,
	"period_id" uuid NOT NULL REFERENCES "timetable_periods"("id") ON DELETE CASCADE,
	"day_of_week" integer NOT NULL,
	"section_id" uuid NOT NULL REFERENCES "sections"("id") ON DELETE CASCADE,
	"subject_id" uuid REFERENCES "subjects"("id") ON DELETE SET NULL,
	"teacher_membership_id" uuid NOT NULL REFERENCES "memberships"("id") ON DELETE CASCADE,
	"room_name" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "timetable_entries_teacher_slot_unique" ON "timetable_entries" (
	"tenant_id",
	"teacher_membership_id",
	"day_of_week",
	"period_id"
);
CREATE INDEX "timetable_entries_teacher_day_idx" ON "timetable_entries" (
	"tenant_id",
	"teacher_membership_id",
	"day_of_week"
);
CREATE INDEX "timetable_entries_period_id_idx" ON "timetable_entries" ("period_id");

UPDATE "navigation_items"
SET
	"href" = '/admin/timetable',
	"is_enabled" = true,
	"sort_order" = 28,
	"visible_to_roles" = ARRAY['teacher']
WHERE "key" = 'timetable' AND "surface" = 'admin';
