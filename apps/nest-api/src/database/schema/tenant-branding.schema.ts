import { index, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { tenants } from './tenants.schema';

export const tenantBranding = pgTable(
	'tenant_branding',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' })
			.unique(),
		displayNameEn: varchar('display_name_en', { length: 200 }),
		displayNameUr: varchar('display_name_ur', { length: 200 }),
		logoUrl: text('logo_url'),
		primaryColor: varchar('primary_color', { length: 7 }),
		accentColor: varchar('accent_color', { length: 7 }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index('tenant_branding_tenant_id_idx').on(table.tenantId)],
);

export type TenantBrandingRecord = typeof tenantBranding.$inferSelect;
