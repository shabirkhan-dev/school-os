import { apiClient } from "@/lib/api/client";
import type {
	CreateTenantInput,
	Tenant,
	TenantMembership,
	UpdateTenantInput,
} from "../types/tenant.types";

export const tenantsService = {
	list: (accessToken: string) => apiClient.get<{ tenants: Tenant[] }>("/tenants", { accessToken }),
	get: (accessToken: string, tenantId: string) =>
		apiClient.get<{ tenant: Tenant }>(`/tenants/${tenantId}`, { accessToken }),
	getMembership: (accessToken: string, tenantId: string) =>
		apiClient.get<{ membership: TenantMembership }>(`/tenants/${tenantId}/membership`, {
			accessToken,
		}),
	create: (accessToken: string, input: CreateTenantInput) =>
		apiClient.post<{ tenant: Tenant }>("/tenants", input, { accessToken }),
	update: (accessToken: string, tenantId: string, input: UpdateTenantInput) =>
		apiClient.patch<{ tenant: Tenant }>(`/tenants/${tenantId}`, input, { accessToken }),
};
