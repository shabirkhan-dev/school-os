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
]);

const teacherTenantAccess = new Set<PermissionCode>([
	...readOnlyTenantAccess,
	PermissionCodes.ATTENDANCE_MARK,
]);

const roleMatrix: Record<MembershipRecord['role'], ReadonlySet<PermissionCode>> = {
	owner: fullTenantAccess,
	principal: fullTenantAccess,
	admin: fullTenantAccess,
	teacher: teacherTenantAccess,
	parent: readOnlyTenantAccess,
	student: readOnlyTenantAccess,
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
	} as unknown as PermissionsService;
}
