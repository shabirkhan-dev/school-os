import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
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
import { CurrentTenant } from '@/modules/tenants/current-tenant.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import type { TenantContext } from '@/modules/tenants/tenant-context.types';
import { InviteMemberDto, UpdateMemberDto } from './members.dto';
import { MembersService } from './members.service';

@ApiTags('Members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@Controller({ path: 'tenants/:tenantId/members', version: '1' })
export class MembersController {
	constructor(private readonly members: MembersService) {}

	@Get()
	@RequirePermissions(PermissionCodes.TENANT_MEMBERSHIP_READ)
	@ApiOperation({ summary: 'List organization members and pending invites' })
	listMembers(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
	) {
		return this.members.listMembers(user.sub, tenantId);
	}

	@Post('invite')
	@RequirePermissions(PermissionCodes.TENANT_MEMBERSHIP_INVITE)
	@ApiOperation({ summary: 'Invite a user to the organization by email' })
	inviteMember(
		@CurrentUser() user: AccessTokenPayload,
		@CurrentTenant() tenant: TenantContext,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Body() body: InviteMemberDto,
	) {
		return this.members.inviteMember(user.sub, tenantId, body, tenant.membershipId);
	}

	@Patch(':membershipId')
	@RequirePermissions(PermissionCodes.TENANT_MEMBERSHIP_MANAGE)
	@ApiOperation({ summary: 'Update a member role, campus, or status' })
	updateMember(
		@CurrentUser() user: AccessTokenPayload,
		@CurrentTenant() tenant: TenantContext,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('membershipId', new ParseUUIDPipe({ version: '4' })) membershipId: string,
		@Body() body: UpdateMemberDto,
	) {
		return this.members.updateMember(user.sub, tenantId, membershipId, body, tenant.membershipId);
	}

	@Delete('invites/:inviteId')
	@RequirePermissions(PermissionCodes.TENANT_MEMBERSHIP_INVITE)
	@ApiOperation({ summary: 'Revoke a pending invite' })
	revokeInvite(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('inviteId', new ParseUUIDPipe({ version: '4' })) inviteId: string,
	) {
		return this.members.revokeInvite(user.sub, tenantId, inviteId);
	}

	@Post('invites/:inviteId/resend')
	@HttpCode(HttpStatus.OK)
	@RequirePermissions(PermissionCodes.TENANT_MEMBERSHIP_INVITE)
	@ApiOperation({ summary: 'Resend a pending invite email' })
	resendInvite(
		@CurrentUser() user: AccessTokenPayload,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) tenantId: string,
		@Param('inviteId', new ParseUUIDPipe({ version: '4' })) inviteId: string,
	) {
		return this.members.resendInvite(user.sub, tenantId, inviteId);
	}
}
