import {
	doublePrecision,
	index,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';

export const campusStatus = pgEnum('campus_status', ['active', 'inactive']);

export const campuses = pgTable(
	'campuses',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 200 }).notNull(),
		code: varchar('code', { length: 32 }).notNull(),
		address: text('address'),
		geoLat: doublePrecision('geo_lat'),
		geoLng: doublePrecision('geo_lng'),
		status: campusStatus('status').notNull().default('active'),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('campuses_tenant_code_unique').on(table.tenantId, table.code),
		index('campuses_tenant_id_idx').on(table.tenantId),
		index('campuses_status_idx').on(table.status),
	],
);

export type CampusRecord = typeof campuses.$inferSelect;
export type NewCampusRecord = typeof campuses.$inferInsert;
