import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { AppConfigService } from '@/config/app-config.service';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
	constructor(private readonly config: AppConfigService) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		if (safeMethods.has(request.method)) {
			return true;
		}

		const origin = request.headers.origin;
		if (!origin) {
			throw new ForbiddenException({
				code: 'AUTH_CSRF_REJECTED',
				message: 'Request origin is required for state-changing methods',
			});
		}

		const requestedWith = request.headers['x-requested-with'];
		if (this.config.corsOrigins.includes(origin) && requestedWith === 'XMLHttpRequest') {
			return true;
		}

		throw new ForbiddenException({
			code: 'AUTH_CSRF_REJECTED',
			message: 'Request origin could not be verified',
		});
	}
}
