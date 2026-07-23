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
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import { CreateCampusDto, UpdateCampusDto } from './campuses.dto';
import { CampusesService } from './campuses.service';

@ApiTags('Campuses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId/campuses', version: '1' })
export class CampusesController {
	constructor(private readonly campuses: CampusesService) {}

	@Post()
	@RequirePermissions(PermissionCodes.TENANT_CAMPUS_CREATE)
	@ApiOperation({ summary: 'Create a campus under a tenant' })
	create(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: CreateCampusDto,
	) {
		return this.campuses.create(user.sub, tenantId, body);
	}

	@Get()
	@ApiOperation({ summary: 'List campuses for a tenant' })
	list(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.campuses.list(user.sub, tenantId);
	}

	@Get(':campusId')
	@ApiOperation({ summary: 'Get a campus by id within a tenant' })
	get(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('campusId', new ParseUUIDPipe({ version: '4' })) campusId: string,
	) {
		return this.campuses.get(user.sub, tenantId, campusId);
	}

	@Patch(':campusId')
	@RequirePermissions(PermissionCodes.TENANT_CAMPUS_UPDATE)
	@ApiOperation({ summary: 'Update a campus (requires tenant.campus.update)' })
	update(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('campusId', new ParseUUIDPipe({ version: '4' })) campusId: string,
		@Body() body: UpdateCampusDto,
	) {
		return this.campuses.update(user.sub, tenantId, campusId, body);
	}
}
