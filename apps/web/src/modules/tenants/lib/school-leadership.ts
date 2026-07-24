import type { MembershipRole } from "@/modules/tenants/constants/permission-codes";

export type SchoolLeadershipRole = Extract<MembershipRole, "principal" | "vice_principal">;

export function isSchoolLeadershipRole(
	role: MembershipRole | null | undefined,
): role is SchoolLeadershipRole {
	return role === "principal" || role === "vice_principal";
}
