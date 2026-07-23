import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { MembershipsRepository } from './memberships.repository';

@Injectable()
export class MembershipsService {
	constructor(private readonly memberships: MembershipsRepository) {}

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

	async requireManagementAccess(userId: string, tenantId: string) {
		const membership = await this.requireActiveMembership(userId, tenantId);
		if (!this.memberships.canManageTenant(membership.role)) {
			throw new ForbiddenException({
				code: 'TENANT_ACCESS_DENIED',
				message: 'You do not have permission to manage this tenant',
			});
		}
		return membership;
	}
}
