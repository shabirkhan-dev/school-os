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
import { CurrentTenant } from '@/modules/tenants/current-tenant.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import type { TenantContext } from '@/modules/tenants/tenant-context.types';
import { AssignSectionSubjectDto, CreateSubjectDto, UpsertStaffProfileDto } from './staff.dto';
import { StaffService } from './staff.service';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'tenants/:tenantId', version: '1' })
export class StaffController {
	constructor(private readonly staff: StaffService) {}

	@Get('teachers')
	@ApiOperation({ summary: 'List teachers with profile summaries' })
	listTeachers(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.staff.listTeachers(user.sub, tenantId);
	}

	@Get('teachers/me')
	@ApiOperation({ summary: 'Get current teacher profile and assignments' })
	getMyProfile(@CurrentTenant() tenant: TenantContext) {
		return this.staff.getMyTeacherProfile(tenant);
	}

	@Get('teachers/me/dashboard')
	@ApiOperation({ summary: 'Get smart dashboard stats for the current teacher' })
	getMyDashboard(
		@CurrentTenant() tenant: TenantContext,
		@Query('sessionDate') sessionDate?: string,
	) {
		const date = sessionDate ?? new Date().toISOString().slice(0, 10);
		return this.staff.getMyTeacherDashboard(tenant, date);
	}

	@Get('teachers/me/sections/:sectionId/students')
	@ApiOperation({ summary: 'List students in a section assigned to the current teacher' })
	getMySectionStudents(
		@CurrentTenant() tenant: TenantContext,
		@Param('sectionId', new ParseUUIDPipe({ version: '4' })) sectionId: string,
	) {
		return this.staff.getMySectionStudents(tenant, sectionId);
	}

	@Patch('teachers/me/profile')
	@ApiOperation({ summary: 'Update current teacher staff profile' })
	upsertMyProfile(
		@CurrentTenant() tenant: TenantContext,
		@Body(new ZodValidationPipe(UpsertStaffProfileDto.schema)) body: UpsertStaffProfileDto,
	) {
		return this.staff.upsertMyTeacherProfile(tenant, body);
	}

	@Get('teachers/:membershipId')
	@ApiOperation({ summary: 'Get teacher profile, homeroom sections, and subject assignments' })
	getTeacher(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('membershipId', new ParseUUIDPipe({ version: '4' })) membershipId: string,
	) {
		return this.staff.getTeacher(user.sub, tenantId, membershipId);
	}

	@Patch('teachers/:membershipId/profile')
	@ApiOperation({ summary: 'Create or update teacher staff profile' })
	upsertProfile(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('membershipId', new ParseUUIDPipe({ version: '4' })) membershipId: string,
		@Body(new ZodValidationPipe(UpsertStaffProfileDto.schema)) body: UpsertStaffProfileDto,
	) {
		return this.staff.upsertTeacherProfile(user.sub, tenantId, membershipId, body);
	}

	@Get('subjects')
	@ApiOperation({ summary: 'List subject catalog' })
	listSubjects(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.staff.listSubjects(user.sub, tenantId);
	}

	@Post('subjects')
	@ApiOperation({ summary: 'Create a subject' })
	createSubject(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body(new ZodValidationPipe(CreateSubjectDto.schema)) body: CreateSubjectDto,
	) {
		return this.staff.createSubject(user.sub, tenantId, body);
	}

	@Post('section-subjects')
	@ApiOperation({ summary: 'Assign a teacher to teach a subject in a section' })
	assignSectionSubject(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body(new ZodValidationPipe(AssignSectionSubjectDto.schema)) body: AssignSectionSubjectDto,
	) {
		return this.staff.assignSectionSubject(user.sub, tenantId, body);
	}
}
