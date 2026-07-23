import type { MembershipRecord } from '@/database/schema';

import type { PermissionCode } from '@/modules/authorization/permission-codes';

export type TenantContext = {
	tenantId: string;
	membershipId: string;
	userId: string;
	role: MembershipRecord['role'];
	campusId: string | null;
	permissions: readonly PermissionCode[];
};
