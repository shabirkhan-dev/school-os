import {
	index,
	integer,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';

export const classes = pgTable(
	'classes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 120 }).notNull(),
		sortOrder: integer('sort_order').notNull().default(0),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('classes_tenant_name_unique').on(table.tenantId, table.name),
		index('classes_tenant_id_idx').on(table.tenantId),
	],
);

export type ClassRecord = typeof classes.$inferSelect;
