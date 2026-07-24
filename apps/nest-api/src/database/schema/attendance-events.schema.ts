import {
	index,
	jsonb,
	pgEnum,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { attendanceSessions } from './attendance-sessions.schema';
import { students } from './students.schema';
import { tenants } from './tenants.schema';

export const attendanceEventType = pgEnum('attendance_event_type', [
	'manual_marked',
	'arrival_scanned',
	'departure_scanned',
	'absence_detected',
	'correction_approved',
]);

export const attendanceEvents = pgTable(
	'attendance_events',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		sessionId: uuid('session_id')
			.notNull()
			.references(() => attendanceSessions.id, { onDelete: 'cascade' }),
		studentId: uuid('student_id')
			.notNull()
			.references(() => students.id, { onDelete: 'cascade' }),
		eventType: attendanceEventType('event_type').notNull(),
		source: varchar('source', { length: 32 }).notNull().default('manual'),
		sourceEventId: varchar('source_event_id', { length: 128 }).notNull(),
		payload: jsonb('payload'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('attendance_events_source_event_unique').on(table.tenantId, table.sourceEventId),
		index('attendance_events_session_id_idx').on(table.sessionId),
		index('attendance_events_student_id_idx').on(table.studentId),
	],
);

export type AttendanceEventRecord = typeof attendanceEvents.$inferSelect;
