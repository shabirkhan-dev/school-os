import {
	CanActivate,
	ExecutionContext,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '@/modules/auth/jwt-auth.guard';
import { MembershipsService } from '@/modules/memberships/memberships.service';

import type { TenantContext } from './tenant-context.types';

export type TenantScopedRequest = AuthenticatedRequest & { tenant?: TenantContext };

@Injectable()
export class TenantGuard implements CanActivate {
	constructor(private readonly memberships: MembershipsService) {}

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

		if (request.user.tid && request.user.tid !== tenantId) {
			throw new NotFoundException({
				code: 'TENANT_NOT_FOUND',
				message: 'Tenant not found',
			});
		}

		const membership = await this.memberships.requireActiveMembership(request.user.sub, tenantId);
		request.tenant = {
			tenantId: membership.tenantId,
			membershipId: membership.id,
			userId: request.user.sub,
			role: membership.role,
			campusId: membership.campusId,
		};
		return true;
	}
}
