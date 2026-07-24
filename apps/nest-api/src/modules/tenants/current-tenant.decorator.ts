import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { TenantScopedRequest } from './tenant.guard';
import type { TenantContext } from './tenant-context.types';

export const CurrentTenant = createParamDecorator(
	(_data: unknown, context: ExecutionContext): TenantContext => {
		const request = context.switchToHttp().getRequest<TenantScopedRequest>();
		if (!request.tenant) {
			throw new Error('CurrentTenant used outside TenantGuard');
		}
		return request.tenant;
	},
);
