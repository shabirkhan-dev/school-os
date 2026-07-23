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

export type TenantSettingsConfig = {
	academicYearStartMonth: number;
	attendanceGraceMinutes: number;
	quietHoursStart: string;
	quietHoursEnd: string;
};

export type TenantBrandingConfig = {
	displayNameEn: string | null;
	displayNameUr: string | null;
	logoUrl: string | null;
	primaryColor: string | null;
	accentColor: string | null;
};

export type TenantCommunicationPolicyConfig = {
	whatsappEnabled: boolean;
	smsFallbackEnabled: boolean;
	emailFallbackEnabled: boolean;
	notifyAllGuardians: boolean;
	sickReportRequiresNote: boolean;
};

export type OrganizationConfig = {
	settings: TenantSettingsConfig;
	branding: TenantBrandingConfig;
	communicationPolicy: TenantCommunicationPolicyConfig;
};

export type UpdateOrganizationConfigInput = {
	settings?: Partial<TenantSettingsConfig>;
	branding?: Partial<TenantBrandingConfig>;
	communicationPolicy?: Partial<TenantCommunicationPolicyConfig>;
};

export type CreateCampusInput = {
	name: string;
	code: string;
	address?: string;
	geoLat?: number;
	geoLng?: number;
};
