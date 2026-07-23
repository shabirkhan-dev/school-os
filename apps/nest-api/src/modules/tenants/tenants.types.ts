import type { TenantRecord } from '@/database/schema';

export type PublicTenant = {
	id: string;
	name: string;
	slug: string;
	mission: string | null;
	status: TenantRecord['status'];
	timezone: string;
	defaultLocale: string;
	createdAt: string;
	updatedAt: string;
};

export function toPublicTenant(tenant: TenantRecord): PublicTenant {
	return {
		id: tenant.id,
		name: tenant.name,
		slug: tenant.slug,
		mission: tenant.mission,
		status: tenant.status,
		timezone: tenant.timezone,
		defaultLocale: tenant.defaultLocale,
		createdAt: tenant.createdAt.toISOString(),
		updatedAt: tenant.updatedAt.toISOString(),
	};
}
