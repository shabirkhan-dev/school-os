import type { MembershipRecord } from '@/database/schema';

import { type PermissionCode, PermissionCodes } from '../permission-codes';
import { PermissionsService, permissionDenied } from '../permissions.service';

const fullTenantAccess = new Set<PermissionCode>(Object.values(PermissionCodes));
const readOnlyTenantAccess = new Set<PermissionCode>([
	PermissionCodes.TENANT_SETTINGS_READ,
	PermissionCodes.ACADEMIC_READ,
	PermissionCodes.STUDENTS_READ,
	PermissionCodes.ATTENDANCE_READ,
	PermissionCodes.TENANT_MEMBERSHIP_READ,
	PermissionCodes.HOMEWORK_READ,
	PermissionCodes.ASSESSMENTS_READ,
]);

const teacherTenantAccess = new Set<PermissionCode>([
	...readOnlyTenantAccess,
	PermissionCodes.ATTENDANCE_MARK,
	PermissionCodes.HOMEWORK_READ,
	PermissionCodes.HOMEWORK_WRITE,
	PermissionCodes.ASSESSMENTS_READ,
	PermissionCodes.ASSESSMENTS_WRITE,
]);

const studentTenantAccess = new Set<PermissionCode>([
	PermissionCodes.TENANT_SETTINGS_READ,
	PermissionCodes.HOMEWORK_READ,
	PermissionCodes.ASSESSMENTS_READ,
]);

const parentTenantAccess = new Set<PermissionCode>([
	PermissionCodes.TENANT_SETTINGS_READ,
	PermissionCodes.GUARDIANS_READ,
	PermissionCodes.HOMEWORK_READ,
	PermissionCodes.ASSESSMENTS_READ,
	PermissionCodes.ACADEMIC_READ,
]);

const roleMatrix: Record<MembershipRecord['role'], ReadonlySet<PermissionCode>> = {
	owner: fullTenantAccess,
	principal: fullTenantAccess,
	vice_principal: fullTenantAccess,
	admin: fullTenantAccess,
	teacher: teacherTenantAccess,
	parent: parentTenantAccess,
	student: studentTenantAccess,
};

export function createMockPermissionsService(): PermissionsService {
	return {
		requirePermission(role: MembershipRecord['role'], permission: PermissionCode) {
			if (!roleMatrix[role]?.has(permission)) {
				throw permissionDenied();
			}
		},
		hasPermission(role: MembershipRecord['role'], permission: PermissionCode) {
			return roleMatrix[role]?.has(permission) ?? false;
		},
		hasEveryPermission(role: MembershipRecord['role'], required: readonly PermissionCode[]) {
			const granted = roleMatrix[role];
			if (!granted) return false;
			return required.every((permission) => granted.has(permission));
		},
		getPermissionsForRole(role: MembershipRecord['role']) {
			return [...(roleMatrix[role] ?? [])];
		},
		getPermissionsForRoles(roles: readonly MembershipRecord['role'][]) {
			const merged = new Set<PermissionCode>();
			for (const role of roles) {
				for (const permission of roleMatrix[role] ?? []) {
					merged.add(permission);
				}
			}
			return [...merged];
		},
		async ensureCacheFresh() {},
		async refreshCache() {},
	} as unknown as PermissionsService;
}
