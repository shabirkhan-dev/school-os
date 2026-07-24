import { index, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './users.schema';

export const webauthnAuthenticationChallenges = pgTable(
	'webauthn_authentication_challenges',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
		challengeHash: varchar('challenge_hash', { length: 64 }).notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
		consumedAt: timestamp('consumed_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('webauthn_auth_challenges_expires_at_idx').on(table.expiresAt),
		index('webauthn_auth_challenges_user_id_idx').on(table.userId),
	],
);

export type WebauthnAuthenticationChallengeRecord =
	typeof webauthnAuthenticationChallenges.$inferSelect;
