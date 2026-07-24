import type { MembershipRecord } from '@/database/schema';

export const managementRoles = new Set<MembershipRecord['role']>([
	'owner',
	'principal',
	'vice_principal',
	'admin',
]);

export function isManagementRole(role: MembershipRecord['role']): boolean {
	return managementRoles.has(role);
}

export function hasManagementRole(roles: MembershipRecord['role'][]): boolean {
	return roles.some((role) => managementRoles.has(role));
}
