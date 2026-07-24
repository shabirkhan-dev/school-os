import { sql } from 'drizzle-orm';
import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { campuses } from './campuses.schema';
import { membershipRole, memberships } from './memberships.schema';
import { tenants } from './tenants.schema';

export const membershipInviteStatus = pgEnum('membership_invite_status', [
	'pending',
	'accepted',
	'revoked',
	'expired',
]);

export const membershipInvites = pgTable(
	'membership_invites',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		email: varchar('email', { length: 320 }).notNull(),
		role: membershipRole('role').notNull(),
		campusId: uuid('campus_id').references(() => campuses.id, { onDelete: 'set null' }),
		invitedByMembershipId: uuid('invited_by_membership_id').references(() => memberships.id, {
			onDelete: 'set null',
		}),
		membershipId: uuid('membership_id').references(() => memberships.id, { onDelete: 'set null' }),
		tokenHash: varchar('token_hash', { length: 128 }).notNull(),
		status: membershipInviteStatus('status').notNull().default('pending'),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		acceptedAt: timestamp('accepted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('membership_invites_token_hash_unique').on(table.tokenHash),
		uniqueIndex('membership_invites_pending_tenant_email_unique')
			.on(table.tenantId, table.email)
			.where(sql`status = 'pending'`),
		index('membership_invites_tenant_id_idx').on(table.tenantId),
		index('membership_invites_email_idx').on(table.email),
		index('membership_invites_status_idx').on(table.status),
	],
);

export type MembershipInviteRecord = typeof membershipInvites.$inferSelect;
