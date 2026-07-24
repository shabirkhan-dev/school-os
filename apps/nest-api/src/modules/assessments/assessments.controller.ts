import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Put,
	Query,
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
import {
	CreateAssessmentDto,
	UpdateAssessmentDto,
	UpsertAssessmentResultsDto,
} from './assessments.dto';
import { AssessmentsService } from './assessments.service';

@ApiTags('Assessments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId/assessments', version: '1' })
export class AssessmentsController {
	constructor(private readonly assessments: AssessmentsService) {}

	@Get()
	@RequirePermissions(PermissionCodes.ASSESSMENTS_READ)
	@ApiOperation({ summary: 'List assessments' })
	list(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query('sectionSubjectId') sectionSubjectId?: string,
		@Query('status') status?: 'draft' | 'published' | 'closed',
	) {
		return this.assessments.list(user.sub, tenantId, { sectionSubjectId, status });
	}

	@Get('planner')
	@RequirePermissions(PermissionCodes.ASSESSMENTS_READ)
	@ApiOperation({ summary: 'List assessments in a date range for the test planner' })
	planner(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query('from') from: string,
		@Query('to') to: string,
		@Query('sectionSubjectId') sectionSubjectId?: string,
	) {
		return this.assessments.planner(user.sub, tenantId, { from, to, sectionSubjectId });
	}

	@Get(':assessmentId')
	@RequirePermissions(PermissionCodes.ASSESSMENTS_READ)
	@ApiOperation({ summary: 'Get an assessment with grade roster' })
	getById(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('assessmentId', new ParseUUIDPipe({ version: '4' })) assessmentId: string,
	) {
		return this.assessments.getById(user.sub, tenantId, assessmentId);
	}

	@Post()
	@RequirePermissions(PermissionCodes.ASSESSMENTS_WRITE)
	@ApiOperation({ summary: 'Create an assessment' })
	create(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: CreateAssessmentDto,
	) {
		return this.assessments.create(user.sub, tenantId, body);
	}

	@Patch(':assessmentId')
	@RequirePermissions(PermissionCodes.ASSESSMENTS_WRITE)
	@ApiOperation({ summary: 'Update an assessment' })
	update(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('assessmentId', new ParseUUIDPipe({ version: '4' })) assessmentId: string,
		@Body() body: UpdateAssessmentDto,
	) {
		return this.assessments.update(user.sub, tenantId, assessmentId, body);
	}

	@Put(':assessmentId/results')
	@RequirePermissions(PermissionCodes.ASSESSMENTS_WRITE)
	@ApiOperation({ summary: 'Enter or update grades for an assessment' })
	upsertResults(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('assessmentId', new ParseUUIDPipe({ version: '4' })) assessmentId: string,
		@Body() body: UpsertAssessmentResultsDto,
	) {
		return this.assessments.upsertResults(user.sub, tenantId, assessmentId, body);
	}
}
