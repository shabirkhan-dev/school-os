import {
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

export const tenantStatus = pgEnum('tenant_status', ['active', 'suspended', 'archived']);

export const tenants = pgTable(
	'tenants',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		name: varchar('name', { length: 200 }).notNull(),
		slug: varchar('slug', { length: 80 }).notNull(),
		mission: text('mission'),
		status: tenantStatus('status').notNull().default('active'),
		timezone: varchar('timezone', { length: 64 }).notNull().default('Asia/Karachi'),
		defaultLocale: varchar('default_locale', { length: 16 }).notNull().default('en'),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('tenants_slug_unique').on(table.slug),
		index('tenants_status_idx').on(table.status),
		index('tenants_created_at_idx').on(table.createdAt),
	],
);

export type TenantRecord = typeof tenants.$inferSelect;
export type NewTenantRecord = typeof tenants.$inferInsert;
