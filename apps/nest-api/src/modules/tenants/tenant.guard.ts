import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from '@/modules/auth/jwt-auth.guard';
import { PermissionsService } from '@/modules/authorization/permissions.service';
import { MembershipsService } from '@/modules/memberships/memberships.service';

import type { TenantContext } from './tenant-context.types';

export type TenantScopedRequest = AuthenticatedRequest & { tenant?: TenantContext };

@Injectable()
export class TenantGuard implements CanActivate {
	constructor(
		private readonly memberships: MembershipsService,
		private readonly permissions: PermissionsService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<TenantScopedRequest>();
		if (!request.user) {
			throw new UnauthorizedException({
				code: 'AUTH_REQUIRED',
				message: 'Authentication required',
			});
		}

		const tenantId = request.params.tenantId;
		if (typeof tenantId !== 'string' || !tenantId) {
			return true;
		}

		const membership = await this.memberships.requireActiveMembership(request.user.sub, tenantId);
		const roleRows = await this.memberships.listRolesForMembership(membership.id);
		const roles =
			roleRows.length > 0 ? roleRows.map((row) => row.role) : ([membership.role] as const);
		request.tenant = {
			tenantId: membership.tenantId,
			membershipId: membership.id,
			userId: request.user.sub,
			role: membership.role,
			roles,
			campusId: membership.campusId,
			permissions: this.permissions.getPermissionsForRoles(roles),
		};
		return true;
	}
}
