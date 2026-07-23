import type { MembershipRole } from "@/modules/tenants";

export type MemberStatus = "active" | "invited" | "suspended";

export type Member = {
	id: string;
	tenantId: string;
	userId: string;
	email: string;
	username: string;
	emailVerified: boolean;
	role: MembershipRole;
	status: MemberStatus;
	campusId: string | null;
	campusName: string | null;
	pendingInviteId: string | null;
	inviteExpiresAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type PendingInvite = {
	id: string;
	tenantId: string;
	email: string;
	role: MembershipRole;
	campusId: string | null;
	campusName: string | null;
	membershipId: string | null;
	status: "pending" | "accepted" | "revoked" | "expired";
	expiresAt: string;
	createdAt: string;
};

export type MemberListSummary = {
	total: number;
	active: number;
	invited: number;
	suspended: number;
	pendingEmailInvites: number;
};

export type ActorCapabilities = {
	role: MembershipRole;
	canInvite: boolean;
	canManage: boolean;
	assignableRoles: MembershipRole[];
	invitableRoles: Array<Exclude<MembershipRole, "owner">>;
};

export type MembersListResponse = {
	members: Member[];
	pendingInvites: PendingInvite[];
	summary: MemberListSummary;
	actor: ActorCapabilities;
};

export type InviteMemberInput = {
	email: string;
	role: Exclude<MembershipRole, "owner">;
	campusId?: string;
};

export type UpdateMemberInput = {
	role?: MembershipRole;
	status?: MemberStatus;
	campusId?: string | null;
};

export type InvitePreview = {
	inviteId: string;
	tenantId: string;
	tenantName: string;
	email: string;
	role: MembershipRole;
	expiresAt: string;
};

export type AcceptInviteResult = {
	membership: {
		id: string;
		tenantId: string;
		role: MembershipRole;
		status: MemberStatus;
	};
	tenant: { id: string; name: string };
};

export type UserPendingInvite = {
	inviteId: string;
	tenantId: string;
	tenantName: string;
	email: string;
	role: MembershipRole;
	expiresAt: string;
};
