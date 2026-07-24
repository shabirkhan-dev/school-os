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

import type { StudentRecord } from '@/database/schema';
import type { AccessTokenPayload } from '@/modules/auth/auth.types';
import { CurrentUser } from '@/modules/auth/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { PermissionsGuard } from '@/modules/authorization/permissions.guard';
import { RequirePermissions } from '@/modules/authorization/require-permissions.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import {
	CreateEnrollmentDto,
	CreateStudentDto,
	UpdateEnrollmentDto,
	UpdateStudentDto,
} from './students.dto';
import { StudentsService } from './students.service';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId', version: '1' })
export class StudentsController {
	constructor(private readonly students: StudentsService) {}

	@Get('students')
	@RequirePermissions(PermissionCodes.STUDENTS_READ)
	@ApiOperation({ summary: 'List students for a tenant' })
	listStudents(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query('campusId') campusId?: string,
		@Query('status') status?: StudentRecord['status'],
	) {
		return this.students.listStudents(user.sub, tenantId, { campusId, status });
	}

	@Post('students')
	@RequirePermissions(PermissionCodes.STUDENTS_WRITE)
	@ApiOperation({ summary: 'Create a student record' })
	createStudent(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: CreateStudentDto,
	) {
		return this.students.createStudent(user.sub, tenantId, body);
	}

	@Get('students/me')
	@ApiOperation({ summary: 'Get the logged-in student profile linked to this membership' })
	getMyStudent(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.students.getMyStudentProfile(user.sub, tenantId);
	}

	@Get('students/:studentId')
	@RequirePermissions(PermissionCodes.STUDENTS_READ)
	@ApiOperation({ summary: 'Get a student by id' })
	getStudent(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('studentId', new ParseUUIDPipe({ version: '4' })) studentId: string,
	) {
		return this.students.getStudent(user.sub, tenantId, studentId);
	}

	@Patch('students/:studentId')
	@RequirePermissions(PermissionCodes.STUDENTS_WRITE)
	@ApiOperation({ summary: 'Update a student record' })
	updateStudent(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('studentId', new ParseUUIDPipe({ version: '4' })) studentId: string,
		@Body() body: UpdateStudentDto,
	) {
		return this.students.updateStudent(user.sub, tenantId, studentId, body);
	}

	@Get('students/:studentId/enrollments')
	@RequirePermissions(PermissionCodes.STUDENTS_READ)
	@ApiOperation({ summary: 'List enrollments for a student' })
	listStudentEnrollments(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('studentId', new ParseUUIDPipe({ version: '4' })) studentId: string,
	) {
		return this.students.listEnrollments(user.sub, tenantId, { studentId });
	}

	@Post('students/:studentId/enrollments')
	@RequirePermissions(PermissionCodes.STUDENTS_WRITE)
	@ApiOperation({ summary: 'Enroll a student into a section and academic year' })
	createEnrollment(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('studentId', new ParseUUIDPipe({ version: '4' })) studentId: string,
		@Body() body: CreateEnrollmentDto,
	) {
		return this.students.createEnrollment(user.sub, tenantId, studentId, body);
	}

	@Get('enrollments')
	@RequirePermissions(PermissionCodes.STUDENTS_READ)
	@ApiOperation({ summary: 'List enrollments for a tenant' })
	listEnrollments(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query('sectionId') sectionId?: string,
		@Query('academicYearId') academicYearId?: string,
		@Query('studentId') studentId?: string,
	) {
		return this.students.listEnrollments(user.sub, tenantId, {
			sectionId,
			academicYearId,
			studentId,
		});
	}

	@Patch('enrollments/:enrollmentId')
	@RequirePermissions(PermissionCodes.STUDENTS_WRITE)
	@ApiOperation({ summary: 'Update an enrollment status' })
	updateEnrollment(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('enrollmentId', new ParseUUIDPipe({ version: '4' })) enrollmentId: string,
		@Body() body: UpdateEnrollmentDto,
	) {
		return this.students.updateEnrollment(user.sub, tenantId, enrollmentId, body);
	}
}
