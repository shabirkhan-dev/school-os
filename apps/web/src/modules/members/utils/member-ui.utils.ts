import type { MembershipRole } from "@/modules/tenants";
import type {
	ActorCapabilities,
	Member,
	MemberListSummary,
	MemberStatus,
	PendingInvite,
} from "../types/member.types";

export function canManageMember(actor: ActorCapabilities, member: Member): boolean {
	if (!actor.canManage) return false;
	if (member.role === "owner" && actor.role !== "owner") return false;
	if (actor.role === "principal" && ["principal", "vice_principal", "admin"].includes(member.role))
		return false;
	if (
		actor.role === "vice_principal" &&
		["principal", "vice_principal", "admin"].includes(member.role)
	)
		return false;
	return true;
}

export function roleOptionsForMember(actor: ActorCapabilities, member: Member): MembershipRole[] {
	if (!canManageMember(actor, member)) return [member.role];
	return actor.assignableRoles;
}

export function memberInitials(member: Pick<Member, "username" | "email">): string {
	const source = member.username.trim() || member.email.split("@")[0] || "?";
	const parts = source.split(/[\s._-]+/).filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
	}
	return source.slice(0, 2).toUpperCase();
}

export function formatMemberStatus(status: MemberStatus): string {
	switch (status) {
		case "active":
			return "Active";
		case "invited":
			return "Invited";
		case "suspended":
			return "Suspended";
	}
}

export function formatInviteExpiry(expiresAt: string): string {
	const date = new Date(expiresAt);
	const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
	if (days <= 0) return "Expired";
	if (days === 1) return "Expires tomorrow";
	if (days <= 3) return `Expires in ${days} days · follow up`;
	return `Expires ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

export function isExpiringSoon(expiresAt: string, withinDays = 3): boolean {
	const days = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
	return days > 0 && days <= withinDays;
}

export type MemberInsights = {
	total: number;
	active: number;
	leadership: number;
	staff: number;
	awaiting: number;
	expiringSoon: number;
	hints: {
		total: string;
		active: string;
		leadership: string;
		awaiting: string;
	};
};

export function computeMemberInsights(
	members: Member[],
	pendingInvites: PendingInvite[],
	summary?: MemberListSummary,
): MemberInsights {
	const leadership = members.filter((m) =>
		["owner", "principal", "vice_principal", "admin"].includes(m.role),
	).length;
	const staff = members.filter((m) => m.role === "teacher" && m.status === "active").length;
	const awaiting = (summary?.invited ?? 0) + (summary?.pendingEmailInvites ?? 0);

	const expiringMembers = members.filter(
		(m) => m.inviteExpiresAt && isExpiringSoon(m.inviteExpiresAt),
	).length;
	const expiringPending = pendingInvites.filter((i) => isExpiringSoon(i.expiresAt)).length;
	const expiringSoon = expiringMembers + expiringPending;

	return {
		total: summary?.total ?? members.length,
		active: summary?.active ?? members.filter((m) => m.status === "active").length,
		leadership,
		staff,
		awaiting,
		expiringSoon,
		hints: {
			total: `${members.filter((m) => m.status === "active").length} active now`,
			active: `${staff} teachers · ${members.filter((m) => m.role === "parent").length} parents`,
			leadership: "Owners, principals, and admins",
			awaiting:
				expiringSoon > 0
					? `${expiringSoon} expiring within 3 days · resend if needed`
					: "Invites waiting for acceptance",
		},
	};
}

export function formatJoinedDate(iso: string): string {
	return new Date(iso).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
