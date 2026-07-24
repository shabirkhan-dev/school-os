import type { MembershipRecord } from '@/database/schema';

export const PermissionCodes = {
	TENANT_SETTINGS_READ: 'tenant.settings.read',
	TENANT_SETTINGS_WRITE: 'tenant.settings.write',
	TENANT_CAMPUS_CREATE: 'tenant.campus.create',
	TENANT_CAMPUS_UPDATE: 'tenant.campus.update',
	ACADEMIC_READ: 'academic.read',
	ACADEMIC_WRITE: 'academic.write',
	STUDENTS_READ: 'students.read',
	STUDENTS_WRITE: 'students.write',
	STAFF_READ: 'staff.read',
	STAFF_WRITE: 'staff.write',
	GUARDIANS_READ: 'guardians.read',
	GUARDIANS_WRITE: 'guardians.write',
	ATTENDANCE_READ: 'attendance.read',
	ATTENDANCE_MARK: 'attendance.mark',
	HOMEWORK_READ: 'homework.read',
	HOMEWORK_WRITE: 'homework.write',
	ASSESSMENTS_READ: 'assessments.read',
	ASSESSMENTS_WRITE: 'assessments.write',
	TENANT_MEMBERSHIP_READ: 'tenant.membership.read',
	TENANT_MEMBERSHIP_INVITE: 'tenant.membership.invite',
	TENANT_MEMBERSHIP_MANAGE: 'tenant.membership.manage',
} as const;

export type PermissionCode = (typeof PermissionCodes)[keyof typeof PermissionCodes];

export type MembershipRole = MembershipRecord['role'];
