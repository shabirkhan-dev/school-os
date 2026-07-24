import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import type { AccessTokenPayload } from '@/modules/auth/auth.types';
import { CurrentUser } from '@/modules/auth/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { PermissionsGuard } from '@/modules/authorization/permissions.guard';
import { RequirePermissions } from '@/modules/authorization/require-permissions.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import {
	CreateHomeworkDto,
	type ListHomeworkQuery,
	listHomeworkQuerySchema,
	UpdateHomeworkDto,
} from './homework.dto';
import { HomeworkService } from './homework.service';

@ApiTags('Homework')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId/homework', version: '1' })
export class HomeworkController {
	constructor(private readonly homework: HomeworkService) {}

	@Get()
	@RequirePermissions(PermissionCodes.HOMEWORK_READ)
	@ApiOperation({ summary: 'List homework assignments' })
	list(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query(new ZodValidationPipe(listHomeworkQuerySchema)) query: ListHomeworkQuery,
	) {
		return this.homework.list(user.sub, tenantId, query);
	}

	@Get(':homeworkId')
	@RequirePermissions(PermissionCodes.HOMEWORK_READ)
	@ApiOperation({ summary: 'Get a homework assignment' })
	getById(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('homeworkId', new ParseUUIDPipe({ version: '4' })) homeworkId: string,
	) {
		return this.homework.getById(user.sub, tenantId, homeworkId);
	}

	@Post()
	@RequirePermissions(PermissionCodes.HOMEWORK_WRITE)
	@ApiOperation({ summary: 'Create a homework assignment' })
	create(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: CreateHomeworkDto,
	) {
		return this.homework.create(user.sub, tenantId, body);
	}

	@Patch(':homeworkId')
	@RequirePermissions(PermissionCodes.HOMEWORK_WRITE)
	@ApiOperation({ summary: 'Update a homework assignment' })
	update(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('homeworkId', new ParseUUIDPipe({ version: '4' })) homeworkId: string,
		@Body() body: UpdateHomeworkDto,
	) {
		return this.homework.update(user.sub, tenantId, homeworkId, body);
	}
}
