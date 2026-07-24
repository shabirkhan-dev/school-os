export const PermissionCodes = {
	TENANT_SETTINGS_READ: "tenant.settings.read",
	TENANT_SETTINGS_WRITE: "tenant.settings.write",
	TENANT_CAMPUS_CREATE: "tenant.campus.create",
	TENANT_CAMPUS_UPDATE: "tenant.campus.update",
	ACADEMIC_READ: "academic.read",
	ACADEMIC_WRITE: "academic.write",
	STUDENTS_READ: "students.read",
	STUDENTS_WRITE: "students.write",
	STAFF_READ: "staff.read",
	STAFF_WRITE: "staff.write",
	GUARDIANS_READ: "guardians.read",
	GUARDIANS_WRITE: "guardians.write",
	ATTENDANCE_READ: "attendance.read",
	ATTENDANCE_MARK: "attendance.mark",
	HOMEWORK_READ: "homework.read",
	HOMEWORK_WRITE: "homework.write",
	ASSESSMENTS_READ: "assessments.read",
	ASSESSMENTS_WRITE: "assessments.write",
	TENANT_MEMBERSHIP_READ: "tenant.membership.read",
	TENANT_MEMBERSHIP_INVITE: "tenant.membership.invite",
	TENANT_MEMBERSHIP_MANAGE: "tenant.membership.manage",
} as const;

export type PermissionCode = (typeof PermissionCodes)[keyof typeof PermissionCodes];

export type MembershipRole =
	| "owner"
	| "principal"
	| "vice_principal"
	| "admin"
	| "teacher"
	| "parent"
	| "student";

export const membershipRoleLabels: Record<MembershipRole, string> = {
	owner: "Owner",
	principal: "Principal",
	vice_principal: "Vice Principal",
	admin: "Admin",
	teacher: "Teacher",
	parent: "Parent",
	student: "Student",
};

export const membershipRoleDescriptions: Record<MembershipRole, string> = {
	owner: "Full organization control, billing, and ownership transfer",
	principal: "School leadership — settings, staff, and academic oversight",
	vice_principal: "Deputy leadership — daily operations and academic oversight",
	admin: "Day-to-day administration — members, campuses, and operations",
	teacher: "Classroom access — attendance, grades, and student records",
	parent: "Guardian portal — child progress, fees, and communication",
	student: "Learner portal — assignments, timetable, and announcements",
};
