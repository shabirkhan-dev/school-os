import {
	date,
	index,
	pgEnum,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { campuses } from './campuses.schema';
import { tenants } from './tenants.schema';

export const studentStatus = pgEnum('student_status', [
	'active',
	'inactive',
	'graduated',
	'withdrawn',
]);

export const studentGender = pgEnum('student_gender', [
	'male',
	'female',
	'other',
	'prefer_not_to_say',
]);

export const students = pgTable(
	'students',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		campusId: uuid('campus_id')
			.notNull()
			.references(() => campuses.id, { onDelete: 'cascade' }),
		studentCode: varchar('student_code', { length: 32 }).notNull(),
		firstName: varchar('first_name', { length: 100 }).notNull(),
		lastName: varchar('last_name', { length: 100 }).notNull(),
		dateOfBirth: date('date_of_birth'),
		gender: studentGender('gender'),
		status: studentStatus('status').notNull().default('active'),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('students_tenant_code_unique').on(table.tenantId, table.studentCode),
		index('students_tenant_id_idx').on(table.tenantId),
		index('students_campus_id_idx').on(table.campusId),
		index('students_status_idx').on(table.status),
	],
);

export type StudentRecord = typeof students.$inferSelect;
