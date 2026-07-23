import type { MembershipInviteRecord, MembershipRecord } from '@/database/schema';

export type PublicMember = {
	id: string;
	tenantId: string;
	userId: string;
	email: string;
	username: string;
	emailVerified: boolean;
	role: MembershipRecord['role'];
	status: MembershipRecord['status'];
	campusId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type PublicPendingInvite = {
	id: string;
	tenantId: string;
	email: string;
	role: MembershipRecord['role'];
	campusId: string | null;
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

export function toPublicMember(input: {
	membership: MembershipRecord;
	user: { id: string; email: string; username: string; emailVerified: Date | null };
}): PublicMember {
	return {
		id: input.membership.id,
		tenantId: input.membership.tenantId,
		userId: input.membership.userId,
		email: input.user.email,
		username: input.user.username,
		emailVerified: input.user.emailVerified !== null,
		role: input.membership.role,
		status: input.membership.status,
		campusId: input.membership.campusId,
		createdAt: input.membership.createdAt.toISOString(),
		updatedAt: input.membership.updatedAt.toISOString(),
	};
}

export function toPublicPendingInvite(invite: MembershipInviteRecord): PublicPendingInvite {
	return {
		id: invite.id,
		tenantId: invite.tenantId,
		email: invite.email,
		role: invite.role,
		campusId: invite.campusId,
		status: invite.status,
		expiresAt: invite.expiresAt.toISOString(),
		createdAt: invite.createdAt.toISOString(),
	};
}
