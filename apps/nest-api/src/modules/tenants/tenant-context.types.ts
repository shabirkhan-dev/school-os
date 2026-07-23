import type { MembershipRecord } from '@/database/schema';

export type TenantContext = {
	tenantId: string;
	membershipId: string;
	userId: string;
	role: MembershipRecord['role'];
	campusId: string | null;
};
