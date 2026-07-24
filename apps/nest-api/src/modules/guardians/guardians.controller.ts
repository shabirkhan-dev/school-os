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
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import type { AccessTokenPayload } from '@/modules/auth/auth.types';
import { CurrentUser } from '@/modules/auth/current-user.decorator';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { PermissionsGuard } from '@/modules/authorization/permissions.guard';
import { RequirePermissions } from '@/modules/authorization/require-permissions.decorator';
import { CurrentTenant } from '@/modules/tenants/current-tenant.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import type { TenantContext } from '@/modules/tenants/tenant-context.types';
import { CreateGuardianDto, LinkStudentGuardianDto, UpdateGuardianDto } from './guardians.dto';
import { GuardiansService } from './guardians.service';

@ApiTags('Guardians')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId', version: '1' })
export class GuardiansController {
	constructor(private readonly guardians: GuardiansService) {}

	@Get('guardians')
	@RequirePermissions(PermissionCodes.GUARDIANS_READ)
	@ApiOperation({ summary: 'List guardians' })
	listGuardians(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.guardians.listGuardians(user.sub, tenantId);
	}

	@Post('guardians')
	@RequirePermissions(PermissionCodes.GUARDIANS_WRITE)
	@ApiOperation({ summary: 'Create a guardian contact' })
	createGuardian(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body(new ZodValidationPipe(CreateGuardianDto.schema)) body: CreateGuardianDto,
	) {
		return this.guardians.createGuardian(user.sub, tenantId, body);
	}

	@Patch('guardians/:guardianId')
	@RequirePermissions(PermissionCodes.GUARDIANS_WRITE)
	@ApiOperation({ summary: 'Update guardian contact details' })
	updateGuardian(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('guardianId', new ParseUUIDPipe({ version: '4' })) guardianId: string,
		@Body(new ZodValidationPipe(UpdateGuardianDto.schema)) body: UpdateGuardianDto,
	) {
		return this.guardians.updateGuardian(user.sub, tenantId, guardianId, body);
	}

	@Get('students/:studentId/guardians')
	@RequirePermissions(PermissionCodes.GUARDIANS_READ)
	@ApiOperation({ summary: 'List guardians linked to a student' })
	listStudentGuardians(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('studentId', new ParseUUIDPipe({ version: '4' })) studentId: string,
	) {
		return this.guardians.listStudentGuardians(user.sub, tenantId, studentId);
	}

	@Post('students/:studentId/guardians')
	@RequirePermissions(PermissionCodes.GUARDIANS_WRITE)
	@ApiOperation({ summary: 'Link an existing or new guardian to a student' })
	linkStudentGuardian(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('studentId', new ParseUUIDPipe({ version: '4' })) studentId: string,
		@Body(new ZodValidationPipe(LinkStudentGuardianDto.schema)) body: LinkStudentGuardianDto,
	) {
		return this.guardians.linkStudentGuardian(user.sub, tenantId, studentId, body);
	}

	@Get('guardians/me/children')
	@ApiOperation({ summary: 'List children linked to the current parent account' })
	getMyChildren(@CurrentTenant() tenant: TenantContext) {
		return this.guardians.getMyChildren(tenant);
	}
}
