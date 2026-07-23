import {
	index,
	integer,
	pgEnum,
	pgTable,
	time,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { campuses } from './campuses.schema';
import { memberships } from './memberships.schema';
import { sections } from './sections.schema';
import { subjects } from './subjects.schema';
import { tenants } from './tenants.schema';

export const timetablePeriodKind = pgEnum('timetable_period_kind', ['period', 'break']);

export const timetablePeriods = pgTable(
	'timetable_periods',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 64 }).notNull(),
		startsAt: time('starts_at').notNull(),
		endsAt: time('ends_at').notNull(),
		kind: timetablePeriodKind('kind').notNull().default('period'),
		sortOrder: integer('sort_order').notNull().default(0),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('timetable_periods_tenant_name_unique').on(table.tenantId, table.name),
		index('timetable_periods_tenant_sort_idx').on(table.tenantId, table.sortOrder),
	],
);

export const timetableEntries = pgTable(
	'timetable_entries',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		campusId: uuid('campus_id')
			.notNull()
			.references(() => campuses.id, { onDelete: 'cascade' }),
		periodId: uuid('period_id')
			.notNull()
			.references(() => timetablePeriods.id, { onDelete: 'cascade' }),
		dayOfWeek: integer('day_of_week').notNull(),
		sectionId: uuid('section_id')
			.notNull()
			.references(() => sections.id, { onDelete: 'cascade' }),
		subjectId: uuid('subject_id').references(() => subjects.id, { onDelete: 'set null' }),
		teacherMembershipId: uuid('teacher_membership_id')
			.notNull()
			.references(() => memberships.id, { onDelete: 'cascade' }),
		roomName: varchar('room_name', { length: 64 }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('timetable_entries_teacher_slot_unique').on(
			table.tenantId,
			table.teacherMembershipId,
			table.dayOfWeek,
			table.periodId,
		),
		index('timetable_entries_teacher_day_idx').on(
			table.tenantId,
			table.teacherMembershipId,
			table.dayOfWeek,
		),
		index('timetable_entries_period_id_idx').on(table.periodId),
	],
);

export type TimetablePeriodRecord = typeof timetablePeriods.$inferSelect;
export type TimetableEntryRecord = typeof timetableEntries.$inferSelect;
