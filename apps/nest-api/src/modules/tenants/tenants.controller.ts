import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '@/modules/auth/auth.types';
import { CurrentUser } from '@/modules/auth/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { PermissionsGuard } from '@/modules/authorization/permissions.guard';
import { RequirePermissions } from '@/modules/authorization/require-permissions.decorator';
import { CurrentTenant } from '@/modules/tenants/current-tenant.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import type { TenantContext } from '@/modules/tenants/tenant-context.types';
import { CreateTenantDto, UpdateTenantDto } from './tenants.dto';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'tenants', version: '1' })
export class TenantsController {
	constructor(private readonly tenants: TenantsService) {}

	@Post()
	@ApiOperation({ summary: 'Create a tenant and grant the caller owner membership' })
	create(@CurrentUser() user: AccessTokenPayload, @Body() body: CreateTenantDto) {
		return this.tenants.create(user.sub, body);
	}

	@Get()
	@ApiOperation({ summary: 'List tenants the current user belongs to' })
	list(@CurrentUser() user: AccessTokenPayload) {
		return this.tenants.listForUser(user.sub);
	}

	@Get(':tenantId/membership')
	@UseGuards(TenantGuard)
	@ApiOperation({ summary: 'Get the current user membership and permissions in a tenant' })
	getMembership(@CurrentTenant() tenant: TenantContext) {
		return {
			membership: {
				id: tenant.membershipId,
				tenantId: tenant.tenantId,
				role: tenant.role,
				permissions: tenant.permissions,
			},
		};
	}

	@Get(':tenantId')
	@UseGuards(TenantGuard)
	@ApiOperation({ summary: 'Get a tenant by id (members only)' })
	get(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.tenants.getForUser(user.sub, tenantId);
	}

	@Patch(':tenantId')
	@UseGuards(TenantGuard, PermissionsGuard)
	@RequirePermissions(PermissionCodes.TENANT_SETTINGS_WRITE)
	@ApiOperation({ summary: 'Update tenant settings (requires tenant.settings.write)' })
	update(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: UpdateTenantDto,
	) {
		return this.tenants.update(user.sub, tenantId, body);
	}
}
