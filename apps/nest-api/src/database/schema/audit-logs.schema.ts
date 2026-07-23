import { index, jsonb, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { memberships } from './memberships.schema';
import { tenants } from './tenants.schema';

export const auditLogs = pgTable(
	'audit_logs',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		actorMembershipId: uuid('actor_membership_id').references(() => memberships.id, {
			onDelete: 'set null',
		}),
		action: varchar('action', { length: 128 }).notNull(),
		resourceType: varchar('resource_type', { length: 64 }).notNull(),
		resourceId: uuid('resource_id').notNull(),
		metadata: jsonb('metadata'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('audit_logs_tenant_id_idx').on(table.tenantId),
		index('audit_logs_resource_idx').on(table.resourceType, table.resourceId),
	],
);

export type AuditLogRecord = typeof auditLogs.$inferSelect;
