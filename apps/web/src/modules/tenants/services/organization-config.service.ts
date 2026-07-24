import { apiClient } from "@/lib/api/client";
import type { OrganizationConfig, UpdateOrganizationConfigInput } from "../types/tenant.types";

export const organizationConfigService = {
	get: (accessToken: string, tenantId: string) =>
		apiClient.get<{ config: OrganizationConfig }>(`/tenants/${tenantId}/organization-config`, {
			accessToken,
		}),
	update: (accessToken: string, tenantId: string, input: UpdateOrganizationConfigInput) =>
		apiClient.patch<{ config: OrganizationConfig }>(
			`/tenants/${tenantId}/organization-config`,
			input,
			{ accessToken },
		),
};
