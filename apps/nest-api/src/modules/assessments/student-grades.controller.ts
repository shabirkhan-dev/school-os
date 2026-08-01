import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import type { AccessTokenPayload } from '@/modules/auth/auth.types';
import { CurrentUser } from '@/modules/auth/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { PermissionsGuard } from '@/modules/authorization/permissions.guard';
import { RequirePermissions } from '@/modules/authorization/require-permissions.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import { AssessmentsService } from './assessments.service';

@ApiTags('Student grades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId/students', version: '1' })
export class StudentGradesController {
	constructor(private readonly assessments: AssessmentsService) {}

	@Get(':studentId/grades')
	@RequirePermissions(PermissionCodes.ASSESSMENTS_READ)
	@ApiOperation({ summary: 'Get all assessment grades for a student' })
	getStudentGrades(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('studentId', new ParseUUIDPipe({ version: '4' })) studentId: string,
	) {
		return this.assessments.getStudentGrades(user.sub, tenantId, studentId);
	}
}
