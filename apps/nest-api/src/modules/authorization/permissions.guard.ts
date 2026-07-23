import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { TenantScopedRequest } from '@/modules/tenants/tenant.guard';

import type { PermissionCode } from './permission-codes';
import { PermissionsService } from './permissions.service';
import { REQUIRE_PERMISSIONS_KEY } from './require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly permissions: PermissionsService,
	) {}

	canActivate(context: ExecutionContext): boolean {
		const required = this.reflector.getAllAndOverride<PermissionCode[] | undefined>(
			REQUIRE_PERMISSIONS_KEY,
			[context.getHandler(), context.getClass()],
		);
		if (!required?.length) {
			return true;
		}

		const request = context.switchToHttp().getRequest<TenantScopedRequest>();
		if (!request.user) {
			throw new UnauthorizedException({
				code: 'AUTH_REQUIRED',
				message: 'Authentication required',
			});
		}
		if (!request.tenant) {
			throw new ForbiddenException({
				code: 'TENANT_CONTEXT_REQUIRED',
				message: 'Tenant context is required for this action',
			});
		}

		const granted = new Set(request.tenant.permissions);
		if (!required.every((permission) => granted.has(permission))) {
			throw new ForbiddenException({
				code: 'PERMISSION_DENIED',
				message: 'You do not have permission to perform this action',
			});
		}

		return true;
	}
}
