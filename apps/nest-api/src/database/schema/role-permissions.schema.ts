import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { permissions } from './permissions.schema';
import { roles } from './roles.schema';

export const rolePermissions = pgTable(
	'role_permissions',
	{
		roleId: uuid('role_id')
			.notNull()
			.references(() => roles.id, { onDelete: 'cascade' }),
		permissionId: uuid('permission_id')
			.notNull()
			.references(() => permissions.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export type RolePermissionRecord = typeof rolePermissions.$inferSelect;
export type NewRolePermissionRecord = typeof rolePermissions.$inferInsert;
