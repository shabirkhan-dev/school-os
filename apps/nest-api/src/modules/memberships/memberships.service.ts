import { Injectable, NotFoundException } from '@nestjs/common';

import type { MembershipRecord } from '@/database/schema';
import { type PermissionCode, PermissionCodes } from '@/modules/authorization/permission-codes';
import { PermissionsService, permissionDenied } from '@/modules/authorization/permissions.service';

import { hasManagementRole } from './membership-roles';
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

	async listRolesForMembership(membershipId: string) {
		return this.memberships.listRolesForMembership(membershipId);
	}

	async listRoleCodes(membershipId: string, primaryRole: MembershipRecord['role']) {
		const rows = await this.listRolesForMembership(membershipId);
		return rows.length > 0 ? rows.map((row) => row.role) : [primaryRole];
	}

	async requirePermission(userId: string, tenantId: string, permission: PermissionCode) {
		const membership = await this.requireActiveMembership(userId, tenantId);
		await this.permissions.ensureCacheFresh();
		const roles = await this.listRoleCodes(membership.id, membership.role);
		const granted = this.permissions.getPermissionsForRoles(roles);
		if (!granted.includes(permission)) {
			throw permissionDenied();
		}
		return membership;
	}

	async requireManagementAccess(userId: string, tenantId: string) {
		return this.requirePermission(userId, tenantId, PermissionCodes.TENANT_SETTINGS_WRITE);
	}

	async isManagementMember(membership: MembershipRecord): Promise<boolean> {
		const roles = await this.listRoleCodes(membership.id, membership.role);
		return hasManagementRole(roles);
	}

	async addRole(tenantId: string, membershipId: string, role: MembershipRecord['role']) {
		const membership = await this.memberships.findById(tenantId, membershipId);
		if (!membership) {
			throw new NotFoundException({
				code: 'MEMBERSHIP_NOT_FOUND',
				message: 'Membership not found',
			});
		}
		return this.memberships.addRole(membershipId, role);
	}
}
