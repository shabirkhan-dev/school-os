import { apiClient } from "@/lib/api/client";
import type { CreateTenantInput, Tenant } from "../types/tenant.types";

export const tenantsService = {
	list: (accessToken: string) => apiClient.get<{ tenants: Tenant[] }>("/tenants", { accessToken }),
	get: (accessToken: string, tenantId: string) =>
		apiClient.get<{ tenant: Tenant }>(`/tenants/${tenantId}`, { accessToken }),
	create: (accessToken: string, input: CreateTenantInput) =>
		apiClient.post<{ tenant: Tenant }>("/tenants", input, { accessToken }),
	update: (
		accessToken: string,
		tenantId: string,
		input: Partial<CreateTenantInput> & { status?: Tenant["status"] },
	) => apiClient.patch<{ tenant: Tenant }>(`/tenants/${tenantId}`, input, { accessToken }),
};
