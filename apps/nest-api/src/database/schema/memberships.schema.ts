import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { campuses } from './campuses.schema';
import { tenants } from './tenants.schema';
import { users } from './users.schema';

export const membershipStatus = pgEnum('membership_status', ['active', 'invited', 'suspended']);

export const membershipRole = pgEnum('membership_role', [
	'owner',
	'principal',
	'admin',
	'teacher',
	'parent',
	'student',
]);

export const memberships = pgTable(
	'memberships',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		campusId: uuid('campus_id').references(() => campuses.id, { onDelete: 'set null' }),
		role: membershipRole('role').notNull(),
		status: membershipStatus('status').notNull().default('active'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('memberships_tenant_user_unique').on(table.tenantId, table.userId),
		index('memberships_user_id_idx').on(table.userId),
		index('memberships_tenant_id_idx').on(table.tenantId),
		index('memberships_status_idx').on(table.status),
	],
);

export type MembershipRecord = typeof memberships.$inferSelect;
export type NewMembershipRecord = typeof memberships.$inferInsert;
