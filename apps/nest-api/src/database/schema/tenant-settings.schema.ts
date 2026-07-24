import { index, integer, pgTable, smallint, time, timestamp, uuid } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';

export const tenantSettings = pgTable(
	'tenant_settings',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' })
			.unique(),
		academicYearStartMonth: smallint('academic_year_start_month').notNull().default(4),
		attendanceGraceMinutes: integer('attendance_grace_minutes').notNull().default(15),
		quietHoursStart: time('quiet_hours_start').notNull().default('22:00'),
		quietHoursEnd: time('quiet_hours_end').notNull().default('07:00'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index('tenant_settings_tenant_id_idx').on(table.tenantId)],
);

export type TenantSettingsRecord = typeof tenantSettings.$inferSelect;
