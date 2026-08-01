import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
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
	type AttendanceReportQuery,
	attendanceReportQuerySchema,
	type GradesReportQuery,
	gradesReportQuerySchema,
	type HomeworkReportQuery,
	homeworkReportQuerySchema,
	type OverviewQuery,
	overviewQuerySchema,
} from './reports.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId/reports', version: '1' })
export class ReportsController {
	constructor(private readonly reports: ReportsService) {}

	@Get('overview')
	@RequirePermissions(PermissionCodes.ASSESSMENTS_READ)
	@ApiOperation({ summary: 'High-level counts and attendance rate for a tenant or section' })
	overview(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query(new ZodValidationPipe(overviewQuerySchema)) query: OverviewQuery,
	) {
		return this.reports.getOverview(user.sub, tenantId, query);
	}

	@Get('grades')
	@RequirePermissions(PermissionCodes.ASSESSMENTS_READ)
	@ApiOperation({ summary: 'Grade summary per subject and student from gradebook entries' })
	grades(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query(new ZodValidationPipe(gradesReportQuerySchema)) query: GradesReportQuery,
	) {
		return this.reports.getGradesReport(user.sub, tenantId, query);
	}

	@Get('attendance')
	@RequirePermissions(PermissionCodes.ATTENDANCE_READ)
	@ApiOperation({ summary: 'Attendance summary with present/absent/late counts and rate' })
	attendance(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query(new ZodValidationPipe(attendanceReportQuerySchema)) query: AttendanceReportQuery,
	) {
		return this.reports.getAttendanceReport(user.sub, tenantId, query);
	}

	@Get('homework')
	@RequirePermissions(PermissionCodes.HOMEWORK_READ)
	@ApiOperation({ summary: 'Homework completion rates from submissions' })
	homework(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query(new ZodValidationPipe(homeworkReportQuerySchema)) query: HomeworkReportQuery,
	) {
		return this.reports.getHomeworkReport(user.sub, tenantId, query);
	}
}
