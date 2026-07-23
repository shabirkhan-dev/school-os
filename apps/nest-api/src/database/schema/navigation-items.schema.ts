import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

export const navigationSurface = pgEnum('navigation_surface', ['admin']);

export const navigationItems = pgTable(
	'navigation_items',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		key: varchar('key', { length: 64 }).notNull(),
		label: varchar('label', { length: 128 }).notNull(),
		href: varchar('href', { length: 255 }),
		iconKey: varchar('icon_key', { length: 64 }),
		sectionHeading: varchar('section_heading', { length: 64 }).notNull(),
		parentId: uuid('parent_id'),
		requiredPermission: varchar('required_permission', { length: 128 }),
		visibleToRoles: text('visible_to_roles').array(),
		sortOrder: integer('sort_order').notNull().default(0),
		isEnabled: boolean('is_enabled').notNull().default(true),
		surface: navigationSurface('surface').notNull().default('admin'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('navigation_items_surface_idx').on(table.surface),
		index('navigation_items_parent_id_idx').on(table.parentId),
		index('navigation_items_section_sort_idx').on(table.sectionHeading, table.sortOrder),
	],
);

export type NavigationItemRecord = typeof navigationItems.$inferSelect;
export type NewNavigationItemRecord = typeof navigationItems.$inferInsert;
