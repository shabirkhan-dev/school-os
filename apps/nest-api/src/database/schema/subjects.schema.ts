import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';

export const subjects = pgTable(
	'subjects',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		code: varchar('code', { length: 32 }).notNull(),
		name: varchar('name', { length: 128 }).notNull(),
		description: varchar('description', { length: 255 }),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('subjects_tenant_code_unique').on(table.tenantId, table.code),
		index('subjects_tenant_id_idx').on(table.tenantId),
	],
);

export type SubjectRecord = typeof subjects.$inferSelect;
