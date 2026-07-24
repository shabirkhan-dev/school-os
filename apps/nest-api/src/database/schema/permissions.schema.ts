import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const permissions = pgTable(
	'permissions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		code: varchar('code', { length: 128 }).notNull(),
		module: varchar('module', { length: 64 }).notNull(),
		description: text('description'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('permissions_code_unique').on(table.code),
		index('permissions_module_idx').on(table.module),
	],
);

export type PermissionRecord = typeof permissions.$inferSelect;
export type NewPermissionRecord = typeof permissions.$inferInsert;
