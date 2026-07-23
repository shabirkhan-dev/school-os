import type { MembershipRole, PermissionCode } from "../constants/permission-codes";

export type TenantStatus = "active" | "suspended" | "archived";
export type CampusStatus = "active" | "inactive";

export type { MembershipRole, PermissionCode } from "../constants/permission-codes";

export type TenantMembership = {
	id: string;
	tenantId: string;
	role: MembershipRole;
	permissions: PermissionCode[];
};

export type Tenant = {
	id: string;
	name: string;
	slug: string;
	mission: string | null;
	status: TenantStatus;
	timezone: string;
	defaultLocale: string;
	createdAt: string;
	updatedAt: string;
};

export type Campus = {
	id: string;
	tenantId: string;
	name: string;
	code: string;
	address: string | null;
	geoLat: number | null;
	geoLng: number | null;
	status: CampusStatus;
	createdAt: string;
	updatedAt: string;
};

export type CreateTenantInput = {
	name: string;
	slug?: string;
	mission?: string;
	timezone?: string;
	defaultLocale?: string;
};

export type UpdateTenantInput = {
	name?: string;
	mission?: string | null;
	timezone?: string;
	defaultLocale?: string;
	status?: TenantStatus;
};

export type CreateCampusInput = {
	name: string;
	code: string;
	address?: string;
	geoLat?: number;
	geoLng?: number;
};
