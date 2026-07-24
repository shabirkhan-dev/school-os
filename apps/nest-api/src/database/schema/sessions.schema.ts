import { index, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { memberships } from './memberships.schema';
import { tenants } from './tenants.schema';
import { users } from './users.schema';

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		refreshTokenHash: varchar('refresh_token_hash', { length: 64 }).notNull(),
		activeTenantId: uuid('active_tenant_id').references(() => tenants.id, { onDelete: 'set null' }),
		activeMembershipId: uuid('active_membership_id').references(() => memberships.id, {
			onDelete: 'set null',
		}),
		userAgent: varchar('user_agent', { length: 512 }),
		ipAddress: varchar('ip_address', { length: 45 }),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		lastUsedAt: timestamp('last_used_at', { withTimezone: true }).notNull().defaultNow(),
		revokedAt: timestamp('revoked_at', { withTimezone: true }),
		revocationReason: varchar('revocation_reason', { length: 64 }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('sessions_refresh_token_hash_unique').on(table.refreshTokenHash),
		index('sessions_user_id_idx').on(table.userId),
		index('sessions_expires_at_idx').on(table.expiresAt),
		index('sessions_active_tenant_id_idx').on(table.activeTenantId),
	],
);

export type SessionRecord = typeof sessions.$inferSelect;
export type NewSessionRecord = typeof sessions.$inferInsert;
