import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/authorization/permissions.guard';
import { CurrentTenant } from '@/modules/tenants/current-tenant.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import type { TenantContext } from '@/modules/tenants/tenant-context.types';
import { NavigationService } from './navigation.service';

@ApiTags('Navigation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId/navigation', version: '1' })
export class NavigationController {
	constructor(private readonly navigation: NavigationService) {}

	@Get()
	@ApiOperation({ summary: 'Get permission-filtered admin navigation for the current member' })
	getNavigation(
		@CurrentTenant() tenant: TenantContext,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) _tenantId: string,
	) {
		return this.navigation.getAdminNavigation(tenant);
	}
}
