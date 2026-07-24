import { date, index, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { campuses } from './campuses.schema';
import { sections } from './sections.schema';
import { tenants } from './tenants.schema';

export const attendanceSessionType = pgEnum('attendance_session_type', ['class', 'gate', 'bus']);

export const attendanceSessions = pgTable(
	'attendance_sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		campusId: uuid('campus_id')
			.notNull()
			.references(() => campuses.id, { onDelete: 'cascade' }),
		sectionId: uuid('section_id').references(() => sections.id, { onDelete: 'cascade' }),
		sessionType: attendanceSessionType('session_type').notNull().default('class'),
		sessionDate: date('session_date').notNull(),
		startsAt: timestamp('starts_at', { withTimezone: true }),
		endsAt: timestamp('ends_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('attendance_sessions_section_date_unique').on(
			table.tenantId,
			table.sectionId,
			table.sessionDate,
		),
		index('attendance_sessions_tenant_id_idx').on(table.tenantId),
		index('attendance_sessions_campus_id_idx').on(table.campusId),
		index('attendance_sessions_section_id_idx').on(table.sectionId),
		index('attendance_sessions_session_date_idx').on(table.sessionDate),
	],
);

export type AttendanceSessionRecord = typeof attendanceSessions.$inferSelect;
