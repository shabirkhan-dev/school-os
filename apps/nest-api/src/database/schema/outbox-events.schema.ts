import { index, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';

export const outboxEventStatus = pgEnum('outbox_event_status', [
	'pending',
	'processing',
	'processed',
	'failed',
]);

export const outboxEvents = pgTable(
	'outbox_events',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		eventType: varchar('event_type', { length: 128 }).notNull(),
		aggregateType: varchar('aggregate_type', { length: 64 }).notNull(),
		aggregateId: uuid('aggregate_id').notNull(),
		payload: jsonb('payload').notNull(),
		status: outboxEventStatus('status').notNull().default('pending'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		processedAt: timestamp('processed_at', { withTimezone: true }),
	},
	(table) => [
		index('outbox_events_tenant_status_idx').on(table.tenantId, table.status),
		index('outbox_events_status_created_idx').on(table.status, table.createdAt),
		index('outbox_events_created_at_idx').on(table.createdAt),
	],
);

export type OutboxEventRecord = typeof outboxEvents.$inferSelect;
