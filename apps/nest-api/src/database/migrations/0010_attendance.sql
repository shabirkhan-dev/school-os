CREATE TYPE "attendance_session_type" AS ENUM ('class', 'gate', 'bus');
CREATE TYPE "attendance_mark_status" AS ENUM (
	'present',
	'absent',
	'late',
	'excused',
	'left_early',
	'unknown'
);
CREATE TYPE "attendance_event_type" AS ENUM (
	'manual_marked',
	'arrival_scanned',
	'departure_scanned',
	'absence_detected',
	'correction_approved'
);
CREATE TYPE "outbox_event_status" AS ENUM ('pending', 'processing', 'processed', 'failed');

CREATE TABLE "attendance_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"campus_id" uuid NOT NULL REFERENCES "campuses"("id") ON DELETE CASCADE,
	"section_id" uuid REFERENCES "sections"("id") ON DELETE CASCADE,
	"session_type" "attendance_session_type" DEFAULT 'class' NOT NULL,
	"session_date" date NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "attendance_sessions_section_date_unique" ON "attendance_sessions" ("tenant_id", "section_id", "session_date")
WHERE "session_type" = 'class' AND "section_id" IS NOT NULL;
CREATE INDEX "attendance_sessions_tenant_id_idx" ON "attendance_sessions" ("tenant_id");
CREATE INDEX "attendance_sessions_campus_id_idx" ON "attendance_sessions" ("campus_id");
CREATE INDEX "attendance_sessions_section_id_idx" ON "attendance_sessions" ("section_id");
CREATE INDEX "attendance_sessions_session_date_idx" ON "attendance_sessions" ("session_date");

CREATE TABLE "attendance_marks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"session_id" uuid NOT NULL REFERENCES "attendance_sessions"("id") ON DELETE CASCADE,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
	"status" "attendance_mark_status" DEFAULT 'unknown' NOT NULL,
	"marked_at" timestamp with time zone,
	"marked_by_membership_id" uuid REFERENCES "memberships"("id") ON DELETE SET NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "attendance_marks_session_student_unique" ON "attendance_marks" ("session_id", "student_id");
CREATE INDEX "attendance_marks_tenant_id_idx" ON "attendance_marks" ("tenant_id");
CREATE INDEX "attendance_marks_student_id_idx" ON "attendance_marks" ("student_id");
CREATE INDEX "attendance_marks_session_id_idx" ON "attendance_marks" ("session_id");

CREATE TABLE "attendance_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"session_id" uuid NOT NULL REFERENCES "attendance_sessions"("id") ON DELETE CASCADE,
	"student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE CASCADE,
	"event_type" "attendance_event_type" NOT NULL,
	"source" varchar(32) DEFAULT 'manual' NOT NULL,
	"source_event_id" varchar(128) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX "attendance_events_source_event_unique" ON "attendance_events" ("tenant_id", "source_event_id");
CREATE INDEX "attendance_events_session_id_idx" ON "attendance_events" ("session_id");
CREATE INDEX "attendance_events_student_id_idx" ON "attendance_events" ("student_id");

CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"actor_membership_id" uuid REFERENCES "memberships"("id") ON DELETE SET NULL,
	"action" varchar(128) NOT NULL,
	"resource_type" varchar(64) NOT NULL,
	"resource_id" uuid NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs" ("tenant_id");
CREATE INDEX "audit_logs_resource_idx" ON "audit_logs" ("resource_type", "resource_id");

CREATE TABLE "outbox_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
	"event_type" varchar(128) NOT NULL,
	"aggregate_type" varchar(64) NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"status" "outbox_event_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);

CREATE INDEX "outbox_events_tenant_status_idx" ON "outbox_events" ("tenant_id", "status");
CREATE INDEX "outbox_events_created_at_idx" ON "outbox_events" ("created_at");

INSERT INTO "permissions" ("code", "module", "description") VALUES
	('attendance.read', 'attendance', 'View attendance sessions, marks, and summaries'),
	('attendance.mark', 'attendance', 'Mark and update attendance for assigned sections')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code IN ('owner', 'principal', 'admin')
	AND p.code IN ('attendance.read', 'attendance.mark')
ON CONFLICT DO NOTHING;

INSERT INTO "role_permissions" ("role_id", "permission_id")
SELECT r.id, p.id
FROM "roles" r
CROSS JOIN "permissions" p
WHERE r.tenant_id IS NULL
	AND r.code = 'teacher'
	AND p.code IN ('attendance.read', 'attendance.mark')
ON CONFLICT DO NOTHING;
