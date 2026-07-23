import { Injectable, NotFoundException } from '@nestjs/common';

import { type PermissionCode, PermissionCodes } from '@/modules/authorization/permission-codes';
import { PermissionsService } from '@/modules/authorization/permissions.service';

import { MembershipsRepository } from './memberships.repository';

@Injectable()
export class MembershipsService {
	constructor(
		private readonly memberships: MembershipsRepository,
		private readonly permissions: PermissionsService,
	) {}

	async requireActiveMembership(userId: string, tenantId: string) {
		const membership = await this.memberships.findActiveByTenantAndUser(tenantId, userId);
		if (!membership) {
			throw new NotFoundException({
				code: 'TENANT_NOT_FOUND',
				message: 'Tenant not found',
			});
		}
		return membership;
	}

	async requirePermission(userId: string, tenantId: string, permission: PermissionCode) {
		const membership = await this.requireActiveMembership(userId, tenantId);
		this.permissions.requirePermission(membership.role, permission);
		return membership;
	}

	async requireManagementAccess(userId: string, tenantId: string) {
		return this.requirePermission(userId, tenantId, PermissionCodes.TENANT_SETTINGS_WRITE);
	}
}
