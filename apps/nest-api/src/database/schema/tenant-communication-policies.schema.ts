import { boolean, index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';

export const tenantCommunicationPolicies = pgTable(
	'tenant_communication_policies',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' })
			.unique(),
		whatsappEnabled: boolean('whatsapp_enabled').notNull().default(true),
		smsFallbackEnabled: boolean('sms_fallback_enabled').notNull().default(true),
		emailFallbackEnabled: boolean('email_fallback_enabled').notNull().default(true),
		notifyAllGuardians: boolean('notify_all_guardians').notNull().default(false),
		sickReportRequiresNote: boolean('sick_report_requires_note').notNull().default(false),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index('tenant_communication_policies_tenant_id_idx').on(table.tenantId)],
);

export type TenantCommunicationPolicyRecord = typeof tenantCommunicationPolicies.$inferSelect;
