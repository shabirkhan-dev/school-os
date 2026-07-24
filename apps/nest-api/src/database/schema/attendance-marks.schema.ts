import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { attendanceSessions } from './attendance-sessions.schema';
import { memberships } from './memberships.schema';
import { students } from './students.schema';
import { tenants } from './tenants.schema';

export const attendanceMarkStatus = pgEnum('attendance_mark_status', [
	'present',
	'absent',
	'late',
	'excused',
	'left_early',
	'unknown',
]);

export const attendanceMarks = pgTable(
	'attendance_marks',
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
		status: attendanceMarkStatus('status').notNull().default('unknown'),
		markedAt: timestamp('marked_at', { withTimezone: true }),
		markedByMembershipId: uuid('marked_by_membership_id').references(() => memberships.id, {
			onDelete: 'set null',
		}),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('attendance_marks_session_student_unique').on(table.sessionId, table.studentId),
		index('attendance_marks_tenant_id_idx').on(table.tenantId),
		index('attendance_marks_student_id_idx').on(table.studentId),
		index('attendance_marks_session_id_idx').on(table.sessionId),
	],
);

export type AttendanceMarkRecord = typeof attendanceMarks.$inferSelect;
