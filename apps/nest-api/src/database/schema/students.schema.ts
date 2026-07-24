import {
	date,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { campuses } from './campuses.schema';
import { memberships } from './memberships.schema';
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
		middleName: varchar('middle_name', { length: 100 }),
		dateOfBirth: date('date_of_birth'),
		gender: studentGender('gender'),
		email: varchar('email', { length: 255 }),
		phone: varchar('phone', { length: 32 }),
		addressLine1: varchar('address_line1', { length: 255 }),
		addressLine2: varchar('address_line2', { length: 255 }),
		city: varchar('city', { length: 100 }),
		state: varchar('state', { length: 100 }),
		postalCode: varchar('postal_code', { length: 20 }),
		country: varchar('country', { length: 100 }),
		bloodGroup: varchar('blood_group', { length: 8 }),
		medicalNotes: text('medical_notes'),
		emergencyContactName: varchar('emergency_contact_name', { length: 200 }),
		emergencyContactPhone: varchar('emergency_contact_phone', { length: 32 }),
		admittedOn: date('admitted_on'),
		previousSchool: varchar('previous_school', { length: 255 }),
		photoUrl: text('photo_url'),
		status: studentStatus('status').notNull().default('active'),
		membershipId: uuid('membership_id').references(() => memberships.id, { onDelete: 'set null' }),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('students_tenant_code_unique').on(table.tenantId, table.studentCode),
		index('students_tenant_id_idx').on(table.tenantId),
		index('students_campus_id_idx').on(table.campusId),
		index('students_membership_id_idx').on(table.membershipId),
		index('students_status_idx').on(table.status),
	],
);

export type StudentRecord = typeof students.$inferSelect;
