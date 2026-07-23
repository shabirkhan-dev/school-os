import type { MembershipRecord } from '@/database/schema';

export type MembershipRole = MembershipRecord['role'];

const allRoles: MembershipRole[] = ['owner', 'principal', 'admin', 'teacher', 'parent', 'student'];

const invitableRoles: Array<Exclude<MembershipRole, 'owner'>> = [
	'principal',
	'admin',
	'teacher',
	'parent',
	'student',
];

export function getAssignableRoles(actorRole: MembershipRole): MembershipRole[] {
	if (actorRole === 'owner') return allRoles;
	if (actorRole === 'principal') return ['teacher', 'parent', 'student'];
	if (actorRole === 'admin') return ['teacher', 'parent', 'student'];
	return [];
}

export function getInvitableRoles(
	actorRole: MembershipRole,
): Array<Exclude<MembershipRole, 'owner'>> {
	if (actorRole === 'owner') return invitableRoles;
	if (actorRole === 'principal') return ['admin', 'teacher', 'parent', 'student'];
	if (actorRole === 'admin') return ['teacher', 'parent', 'student'];
	return [];
}

export function canManageTarget(actorRole: MembershipRole, targetRole: MembershipRole): boolean {
	if (actorRole === 'owner') return true;
	if (targetRole === 'owner') return false;
	if (actorRole === 'principal' && ['principal', 'admin'].includes(targetRole)) return false;
	return ['owner', 'principal', 'admin'].includes(actorRole);
}

export function buildActorCapabilities(
	actorRole: MembershipRole,
	permissions: { canInvite: boolean; canManage: boolean },
) {
	return {
		role: actorRole,
		canInvite: permissions.canInvite,
		canManage: permissions.canManage,
		assignableRoles: getAssignableRoles(actorRole),
		invitableRoles: getInvitableRoles(actorRole),
	};
}
