import type { MembershipInviteRecord, MembershipRecord } from '@/database/schema';

export type PublicMember = {
	id: string;
	tenantId: string;
	userId: string;
	email: string;
	username: string;
	emailVerified: boolean;
	role: MembershipRecord['role'];
	roles: MembershipRecord['role'][];
	status: MembershipRecord['status'];
	campusId: string | null;
	campusName: string | null;
	pendingInviteId: string | null;
	inviteExpiresAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type PublicPendingInvite = {
	id: string;
	tenantId: string;
	email: string;
	role: MembershipRecord['role'];
	campusId: string | null;
	campusName: string | null;
	membershipId: string | null;
	status: MembershipInviteRecord['status'];
	expiresAt: string;
	createdAt: string;
};

export type PublicInvitePreview = {
	inviteId: string;
	tenantId: string;
	tenantName: string;
	email: string;
	role: MembershipRecord['role'];
	expiresAt: string;
};

export type MemberListSummary = {
	total: number;
	active: number;
	invited: number;
	suspended: number;
	pendingEmailInvites: number;
};

export type ActorCapabilities = {
	role: MembershipRecord['role'];
	canInvite: boolean;
	canManage: boolean;
	assignableRoles: MembershipRecord['role'][];
	invitableRoles: Array<Exclude<MembershipRecord['role'], 'owner'>>;
};

type CampusInfo = { name: string; code: string };

export function toPublicMember(input: {
	membership: MembershipRecord;
	user: { id: string; email: string; username: string; emailVerified: Date | null };
	campus?: CampusInfo | null;
	pendingInvite?: { id: string; expiresAt: Date } | null;
	roles?: MembershipRecord['role'][];
}): PublicMember {
	const roles = input.roles?.length
		? input.roles
		: input.membership.role
			? [input.membership.role]
			: [];
	return {
		id: input.membership.id,
		tenantId: input.membership.tenantId,
		userId: input.membership.userId,
		email: input.user.email,
		username: input.user.username,
		emailVerified: input.user.emailVerified !== null,
		role: input.membership.role,
		roles,
		status: input.membership.status,
		campusId: input.membership.campusId,
		campusName: input.campus?.name ?? null,
		pendingInviteId: input.pendingInvite?.id ?? null,
		inviteExpiresAt: input.pendingInvite?.expiresAt.toISOString() ?? null,
		createdAt: input.membership.createdAt.toISOString(),
		updatedAt: input.membership.updatedAt.toISOString(),
	};
}

export function toPublicPendingInvite(
	invite: MembershipInviteRecord,
	campus?: CampusInfo | null,
): PublicPendingInvite {
	return {
		id: invite.id,
		tenantId: invite.tenantId,
		email: invite.email,
		role: invite.role,
		campusId: invite.campusId,
		campusName: campus?.name ?? null,
		membershipId: invite.membershipId,
		status: invite.status,
		expiresAt: invite.expiresAt.toISOString(),
		createdAt: invite.createdAt.toISOString(),
	};
}
