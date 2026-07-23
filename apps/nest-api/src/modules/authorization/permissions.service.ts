import { ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';

import type { MembershipRecord } from '@/database/schema';

import type { PermissionCode } from './permission-codes';
import { PermissionsRepository } from './permissions.repository';

@Injectable()
export class PermissionsService implements OnModuleInit {
	private rolePermissions = new Map<string, ReadonlySet<PermissionCode>>();

	constructor(private readonly permissionsRepository: PermissionsRepository) {}

	async onModuleInit(): Promise<void> {
		await this.refreshCache();
	}

	async refreshCache(): Promise<void> {
		const map = await this.permissionsRepository.loadRolePermissionMap();
		this.rolePermissions = new Map(
			[...map.entries()].map(([role, codes]) => [role, codes as ReadonlySet<PermissionCode>]),
		);
	}

	listCatalog() {
		return this.permissionsRepository.listPermissions();
	}

	getPermissionsForRole(role: MembershipRecord['role']): readonly PermissionCode[] {
		return [...(this.rolePermissions.get(role) ?? [])];
	}

	hasPermission(role: MembershipRecord['role'], permission: PermissionCode): boolean {
		return this.rolePermissions.get(role)?.has(permission) ?? false;
	}

	hasEveryPermission(role: MembershipRecord['role'], required: readonly PermissionCode[]): boolean {
		if (required.length === 0) return true;
		const granted = this.rolePermissions.get(role);
		if (!granted) return false;
		return required.every((permission) => granted.has(permission));
	}

	requirePermission(role: MembershipRecord['role'], permission: PermissionCode): void {
		if (!this.hasPermission(role, permission)) {
			throw permissionDenied();
		}
	}
}

export function permissionDenied(): ForbiddenException {
	return new ForbiddenException({
		code: 'PERMISSION_DENIED',
		message: 'You do not have permission to perform this action',
	});
}
