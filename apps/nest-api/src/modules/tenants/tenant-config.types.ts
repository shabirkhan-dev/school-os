export type PublicTenantSettings = {
	academicYearStartMonth: number;
	attendanceGraceMinutes: number;
	quietHoursStart: string;
	quietHoursEnd: string;
};

export type PublicTenantBranding = {
	displayNameEn: string | null;
	displayNameUr: string | null;
	logoUrl: string | null;
	primaryColor: string | null;
	accentColor: string | null;
};

export type PublicTenantCommunicationPolicy = {
	whatsappEnabled: boolean;
	smsFallbackEnabled: boolean;
	emailFallbackEnabled: boolean;
	notifyAllGuardians: boolean;
	sickReportRequiresNote: boolean;
};

export type PublicOrganizationConfig = {
	settings: PublicTenantSettings;
	branding: PublicTenantBranding;
	communicationPolicy: PublicTenantCommunicationPolicy;
};

export function formatTimeValue(value: string): string {
	return value.slice(0, 5);
}
