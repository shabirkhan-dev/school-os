export type TenantStatus = "active" | "suspended" | "archived";
export type CampusStatus = "active" | "inactive";

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

export type CreateCampusInput = {
	name: string;
	code: string;
	address?: string;
	geoLat?: number;
	geoLng?: number;
};
