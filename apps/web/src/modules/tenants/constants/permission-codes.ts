export const PermissionCodes = {
	TENANT_SETTINGS_READ: "tenant.settings.read",
	TENANT_SETTINGS_WRITE: "tenant.settings.write",
	TENANT_CAMPUS_CREATE: "tenant.campus.create",
	TENANT_CAMPUS_UPDATE: "tenant.campus.update",
} as const;

export type PermissionCode = (typeof PermissionCodes)[keyof typeof PermissionCodes];

export type MembershipRole = "owner" | "principal" | "admin" | "teacher" | "parent" | "student";

export const membershipRoleLabels: Record<MembershipRole, string> = {
	owner: "Owner",
	principal: "Principal",
	admin: "Admin",
	teacher: "Teacher",
	parent: "Parent",
	student: "Student",
};
