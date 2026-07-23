import type { TenantMembership } from "@/modules/tenants";

type RawTenantContext = {
	id?: string;
	membershipId?: string;
	tenantId: string;
	role: TenantMembership["role"];
	permissions: TenantMembership["permissions"];
};

export function normalizeTenantContext(
	context: RawTenantContext | null | undefined,
): TenantMembership | null {
	if (!context?.tenantId) return null;
	const id = context.id ?? context.membershipId;
	if (!id) return null;
	return {
		id,
		tenantId: context.tenantId,
		role: context.role,
		permissions: context.permissions ?? [],
	};
}
