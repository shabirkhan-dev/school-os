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

import { tenants } from './tenants.schema';

export const academicYearStatus = pgEnum('academic_year_status', ['draft', 'active', 'archived']);

export const academicYears = pgTable(
	'academic_years',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 64 }).notNull(),
		startsOn: date('starts_on').notNull(),
		endsOn: date('ends_on').notNull(),
		status: academicYearStatus('status').notNull().default('draft'),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('academic_years_tenant_name_unique').on(table.tenantId, table.name),
		index('academic_years_tenant_id_idx').on(table.tenantId),
		index('academic_years_status_idx').on(table.status),
	],
);

export type AcademicYearRecord = typeof academicYears.$inferSelect;
