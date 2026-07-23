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

	@Get(':tenantId')
	@ApiOperation({ summary: 'Get a tenant by id (members only)' })
	get(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.tenants.getForUser(user.sub, tenantId);
	}

	@Patch(':tenantId')
	@ApiOperation({ summary: 'Update tenant settings (owner, principal, or admin)' })
	update(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: UpdateTenantDto,
	) {
		return this.tenants.update(user.sub, tenantId, body);
	}
}
