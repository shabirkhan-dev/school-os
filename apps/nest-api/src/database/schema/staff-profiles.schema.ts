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

import { memberships } from './memberships.schema';
import { tenants } from './tenants.schema';

export const staffStatus = pgEnum('staff_status', ['active', 'inactive', 'on_leave']);

export const staffProfiles = pgTable(
	'staff_profiles',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		membershipId: uuid('membership_id')
			.notNull()
			.references(() => memberships.id, { onDelete: 'cascade' }),
		employeeCode: varchar('employee_code', { length: 32 }),
		phone: varchar('phone', { length: 32 }),
		qualification: varchar('qualification', { length: 255 }),
		specialization: varchar('specialization', { length: 255 }),
		hireDate: date('hire_date'),
		status: staffStatus('status').notNull().default('active'),
		notes: text('notes'),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('staff_profiles_membership_unique').on(table.membershipId),
		uniqueIndex('staff_profiles_tenant_employee_code_unique').on(
			table.tenantId,
			table.employeeCode,
		),
		index('staff_profiles_tenant_id_idx').on(table.tenantId),
	],
);

export type StaffProfileRecord = typeof staffProfiles.$inferSelect;
