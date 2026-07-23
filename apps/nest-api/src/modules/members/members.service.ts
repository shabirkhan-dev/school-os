import { randomBytes } from 'node:crypto';

import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { AppConfigService } from '@/config/app-config.service';
import type { MembershipRecord } from '@/database/schema';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { CampusesRepository } from '@/modules/campuses/campuses.repository';
import { EmailService } from '@/modules/email/email.service';
import { hashInviteToken } from '@/modules/memberships/membership-invites.service';
import { MembershipsRepository } from '@/modules/memberships/memberships.repository';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import { TenantsRepository } from '@/modules/tenants/tenants.repository';
import { UsersService } from '@/modules/users/users.service';
import type { InviteMemberInput, UpdateMemberInput } from './members.dto';
import { toPublicMember, toPublicPendingInvite } from './members.types';

const INVITE_TTL_DAYS = 7;
const managementRoles = new Set<MembershipRecord['role']>(['owner', 'principal', 'admin']);

@Injectable()
export class MembersService {
	constructor(
		private readonly memberships: MembershipsRepository,
		private readonly membershipAccess: MembershipsService,
		private readonly users: UsersService,
		private readonly tenants: TenantsRepository,
		private readonly campuses: CampusesRepository,
		private readonly email: EmailService,
		private readonly config: AppConfigService,
	) {}

	async listMembers(userId: string, tenantId: string) {
		await this.requireRead(userId, tenantId);
		await this.memberships.expireStaleInvites();
		const rows = await this.memberships.listMembersForTenant(tenantId);
		const pendingInvites = await this.memberships.listPendingInvitesForTenant(tenantId);
		const memberEmails = new Set(rows.map((row) => row.user.email.toLowerCase()));

		return {
			members: rows.map(toPublicMember),
			pendingInvites: pendingInvites
				.filter((invite) => !memberEmails.has(invite.email.toLowerCase()))
				.map(toPublicPendingInvite),
		};
	}

	async inviteMember(
		userId: string,
		tenantId: string,
		input: InviteMemberInput,
		invitedByMembershipId: string,
	) {
		await this.requireInvite(userId, tenantId);
		const email = input.email.trim().toLowerCase();
		const tenant = await this.requireTenant(tenantId);

		if (input.campusId) {
			await this.requireCampus(tenantId, input.campusId);
		}

		const existingUser = await this.users.findByEmail(email);
		if (existingUser) {
			const membership = await this.memberships.findByTenantAndUser(tenantId, existingUser.id);
			if (membership && ['active', 'invited'].includes(membership.status)) {
				throw new ConflictException({
					code: 'MEMBERSHIP_ALREADY_EXISTS',
					message: 'This user is already a member or has a pending invite',
				});
			}
		}

		const pendingInvite = await this.memberships.findPendingInviteByTenantAndEmail(tenantId, email);
		if (pendingInvite) {
			throw new ConflictException({
				code: 'INVITE_ALREADY_PENDING',
				message: 'An invite is already pending for this email',
			});
		}

		const token = randomBytes(32).toString('hex');
		const tokenHash = hashInviteToken(token);
		const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

		let membershipId: string | null = null;
		if (existingUser) {
			const membership = await this.memberships.create({
				tenantId,
				userId: existingUser.id,
				role: input.role,
				campusId: input.campusId ?? null,
				status: 'invited',
			});
			membershipId = membership.id;
		}

		const invite = await this.memberships.createInvite({
			tenantId,
			email,
			role: input.role,
			campusId: input.campusId ?? null,
			invitedByMembershipId,
			membershipId,
			tokenHash,
			status: 'pending',
			expiresAt,
		});

		const acceptUrl = `${this.config.webAppUrl}/accept-invite?token=${encodeURIComponent(token)}`;
		await this.email.sendMembershipInvite(email, {
			organizationName: tenant.name,
			role: input.role,
			acceptUrl,
		});

		return {
			invite: toPublicPendingInvite(invite),
			...(this.config.exposeAuthCodes ? { developmentInviteUrl: acceptUrl } : {}),
		};
	}

	async updateMember(
		userId: string,
		tenantId: string,
		membershipId: string,
		input: UpdateMemberInput,
		actorMembershipId: string,
	) {
		const actor = await this.requireManage(userId, tenantId);
		const membership = await this.requireMembership(tenantId, membershipId);

		if (membership.id === actorMembershipId) {
			throw new BadRequestException({
				code: 'CANNOT_UPDATE_SELF',
				message: 'Use another admin to change your own role or status',
			});
		}

		this.assertCanManageTarget(actor.role, membership.role, input.role);

		if (input.role && input.role !== membership.role) {
			if (membership.role === 'owner' || input.role === 'owner') {
				await this.assertOwnerChangeAllowed(tenantId, membership, input.role);
			}
		}

		if (input.status === 'suspended' && membership.role === 'owner') {
			const otherOwners = await this.memberships.countActiveOwners(tenantId, membership.id);
			if (otherOwners === 0) {
				throw new BadRequestException({
					code: 'LAST_OWNER_PROTECTED',
					message: 'Cannot suspend the last active owner',
				});
			}
		}

		if (input.campusId) {
			await this.requireCampus(tenantId, input.campusId);
		}

		const updated = await this.memberships.update(tenantId, membershipId, {
			role: input.role,
			status: input.status,
			campusId: input.campusId === undefined ? undefined : input.campusId,
		});
		if (!updated) {
			throw new NotFoundException({
				code: 'MEMBERSHIP_NOT_FOUND',
				message: 'Membership not found',
			});
		}

		const rows = await this.memberships.listMembersForTenant(tenantId);
		const row = rows.find((entry) => entry.membership.id === membershipId);
		if (!row) {
			throw new NotFoundException({
				code: 'MEMBERSHIP_NOT_FOUND',
				message: 'Membership not found',
			});
		}

		return { member: toPublicMember(row) };
	}

	async revokeInvite(userId: string, tenantId: string, inviteId: string) {
		await this.requireInvite(userId, tenantId);
		const invites = await this.memberships.listPendingInvitesForTenant(tenantId);
		const invite = invites.find((row) => row.id === inviteId);
		if (!invite) {
			throw new NotFoundException({
				code: 'INVITE_NOT_FOUND',
				message: 'Pending invite not found',
			});
		}

		await this.memberships.updateInvite(invite.id, { status: 'revoked' });
		if (invite.membershipId) {
			await this.memberships.update(tenantId, invite.membershipId, { status: 'suspended' });
		}

		return { revoked: true };
	}

	private assertCanManageTarget(
		actorRole: MembershipRecord['role'],
		targetRole: MembershipRecord['role'],
		nextRole?: MembershipRecord['role'],
	) {
		if (actorRole === 'owner') return;
		if (targetRole === 'owner' || nextRole === 'owner') {
			throw new ForbiddenException({
				code: 'MEMBERSHIP_MANAGE_FORBIDDEN',
				message: 'Only owners can manage owner memberships',
			});
		}
		if (actorRole === 'principal' && ['principal', 'admin'].includes(targetRole)) {
			throw new ForbiddenException({
				code: 'MEMBERSHIP_MANAGE_FORBIDDEN',
				message: 'Principals cannot manage other leadership roles',
			});
		}
	}

	private async assertOwnerChangeAllowed(
		tenantId: string,
		membership: MembershipRecord,
		nextRole: MembershipRecord['role'],
	) {
		if (membership.role === 'owner' && nextRole !== 'owner') {
			const otherOwners = await this.memberships.countActiveOwners(tenantId, membership.id);
			if (otherOwners === 0) {
				throw new BadRequestException({
					code: 'LAST_OWNER_PROTECTED',
					message: 'Cannot remove the last active owner',
				});
			}
		}
	}

	private async requireRead(userId: string, tenantId: string) {
		await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.TENANT_MEMBERSHIP_READ,
		);
	}

	private async requireInvite(userId: string, tenantId: string) {
		await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.TENANT_MEMBERSHIP_INVITE,
		);
	}

	private async requireManage(userId: string, tenantId: string) {
		const membership = await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.TENANT_MEMBERSHIP_MANAGE,
		);
		if (!managementRoles.has(membership.role)) {
			throw new ForbiddenException({
				code: 'MEMBERSHIP_MANAGE_FORBIDDEN',
				message: 'You cannot manage members in this organization',
			});
		}
		return membership;
	}

	private async requireMembership(tenantId: string, membershipId: string) {
		const membership = await this.memberships.findById(tenantId, membershipId);
		if (!membership) {
			throw new NotFoundException({
				code: 'MEMBERSHIP_NOT_FOUND',
				message: 'Membership not found',
			});
		}
		return membership;
	}

	private async requireTenant(tenantId: string) {
		const tenant = await this.tenants.findById(tenantId);
		if (!tenant) {
			throw new NotFoundException({
				code: 'TENANT_NOT_FOUND',
				message: 'Organization not found',
			});
		}
		return tenant;
	}

	private async requireCampus(tenantId: string, campusId: string) {
		const campus = await this.campuses.findByIdForTenant(tenantId, campusId);
		if (!campus) {
			throw new NotFoundException({
				code: 'CAMPUS_NOT_FOUND',
				message: 'Campus not found',
			});
		}
		return campus;
	}
}
