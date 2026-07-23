import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
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
	AssignSectionTeacherDto,
	CreateAcademicYearDto,
	CreateClassDto,
	CreateSectionDto,
	UpdateAcademicYearDto,
	UpdateClassDto,
	UpdateSectionDto,
} from './academic.dto';
import { AcademicService } from './academic.service';

@ApiTags('Academic')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId', version: '1' })
export class AcademicController {
	constructor(private readonly academic: AcademicService) {}

	@Get('academic-years')
	@RequirePermissions(PermissionCodes.ACADEMIC_READ)
	@ApiOperation({ summary: 'List academic years for a tenant' })
	listAcademicYears(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.academic.listAcademicYears(user.sub, tenantId);
	}

	@Post('academic-years')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Create an academic year' })
	createAcademicYear(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: CreateAcademicYearDto,
	) {
		return this.academic.createAcademicYear(user.sub, tenantId, body);
	}

	@Patch('academic-years/:academicYearId')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Update an academic year' })
	updateAcademicYear(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('academicYearId', new ParseUUIDPipe({ version: '4' })) academicYearId: string,
		@Body() body: UpdateAcademicYearDto,
	) {
		return this.academic.updateAcademicYear(user.sub, tenantId, academicYearId, body);
	}

	@Delete('academic-years/:academicYearId')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Soft-delete an academic year' })
	deleteAcademicYear(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('academicYearId', new ParseUUIDPipe({ version: '4' })) academicYearId: string,
	) {
		return this.academic.deleteAcademicYear(user.sub, tenantId, academicYearId);
	}

	@Get('classes')
	@RequirePermissions(PermissionCodes.ACADEMIC_READ)
	@ApiOperation({ summary: 'List grade levels / classes for a tenant' })
	listClasses(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.academic.listClasses(user.sub, tenantId);
	}

	@Post('classes')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Create a grade level / class' })
	createClass(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: CreateClassDto,
	) {
		return this.academic.createClass(user.sub, tenantId, body);
	}

	@Patch('classes/:classId')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Update a grade level / class' })
	updateClass(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('classId', new ParseUUIDPipe({ version: '4' })) classId: string,
		@Body() body: UpdateClassDto,
	) {
		return this.academic.updateClass(user.sub, tenantId, classId, body);
	}

	@Delete('classes/:classId')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Soft-delete a grade level / class' })
	deleteClass(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('classId', new ParseUUIDPipe({ version: '4' })) classId: string,
	) {
		return this.academic.deleteClass(user.sub, tenantId, classId);
	}

	@Get('sections')
	@RequirePermissions(PermissionCodes.ACADEMIC_READ)
	@ApiOperation({ summary: 'List sections for a tenant' })
	listSections(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Query('campusId') campusId?: string,
		@Query('academicYearId') academicYearId?: string,
	) {
		return this.academic.listSections(user.sub, tenantId, { campusId, academicYearId });
	}

	@Post('sections')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Create a section' })
	createSection(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: CreateSectionDto,
	) {
		return this.academic.createSection(user.sub, tenantId, body);
	}

	@Patch('sections/:sectionId')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Update a section' })
	updateSection(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
		@Body() body: UpdateSectionDto,
	) {
		return this.academic.updateSection(user.sub, tenantId, sectionId, body);
	}

	@Delete('sections/:sectionId')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Soft-delete a section' })
	deleteSection(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
	) {
		return this.academic.deleteSection(user.sub, tenantId, sectionId);
	}

	@Post('sections/:sectionId/assign-teacher')
	@RequirePermissions(PermissionCodes.ACADEMIC_WRITE)
	@ApiOperation({ summary: 'Assign a homeroom teacher to a section' })
	assignSectionTeacher(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
		@Body() body: AssignSectionTeacherDto,
	) {
		return this.academic.assignSectionTeacher(user.sub, tenantId, sectionId, body);
	}
}
