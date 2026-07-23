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
	createdAt: string;
	updatedAt: string;
};

export type PendingInvite = {
	id: string;
	tenantId: string;
	email: string;
	role: MembershipRole;
	campusId: string | null;
	status: "pending" | "accepted" | "revoked" | "expired";
	expiresAt: string;
	createdAt: string;
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
