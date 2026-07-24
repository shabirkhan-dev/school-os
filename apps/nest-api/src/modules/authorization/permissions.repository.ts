import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { permissions, rolePermissions, roles } from '@/database/schema';

@Injectable()
export class PermissionsRepository {
	constructor(private readonly database: DatabaseService) {}

	async listPermissions() {
		return this.database.db
			.select()
			.from(permissions)
			.orderBy(permissions.module, permissions.code);
	}

	async loadRolePermissionMap() {
		const rows = await this.database.db
			.select({
				roleCode: roles.code,
				permissionCode: permissions.code,
			})
			.from(rolePermissions)
			.innerJoin(roles, eq(rolePermissions.roleId, roles.id))
			.innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
			.where(isNull(roles.tenantId));

		const map = new Map<string, Set<string>>();
		for (const row of rows) {
			const codes = map.get(row.roleCode) ?? new Set<string>();
			codes.add(row.permissionCode);
			map.set(row.roleCode, codes);
		}
		return map;
	}

	async findPlatformRoleByCode(code: string) {
		const [role] = await this.database.db
			.select()
			.from(roles)
			.where(and(eq(roles.code, code), isNull(roles.tenantId)))
			.limit(1);
		return role ?? null;
	}
}
