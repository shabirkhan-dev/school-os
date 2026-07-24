import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { users } from './users.schema';

export const totpFactors = pgTable('totp_factors', {
	userId: uuid('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	secretEncrypted: text('secret_encrypted').notNull(),
	isEnabled: boolean('is_enabled').notNull().default(false),
	verifiedAt: timestamp('verified_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const totpRecoveryCodes = pgTable(
	'totp_recovery_codes',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		codeHash: text('code_hash').notNull(),
		usedAt: timestamp('used_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('totp_recovery_codes_user_idx').on(table.userId),
		uniqueIndex('totp_recovery_codes_user_code_unique').on(table.userId, table.codeHash),
	],
);

export type TotpFactorRecord = typeof totpFactors.$inferSelect;
export type TotpRecoveryCodeRecord = typeof totpRecoveryCodes.$inferSelect;
