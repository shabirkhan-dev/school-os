import { apiClient } from "@/lib/api/client";
import type { Campus, CreateCampusInput } from "../types/tenant.types";

export const campusesService = {
	list: (accessToken: string, tenantId: string) =>
		apiClient.get<{ campuses: Campus[] }>(`/tenants/${tenantId}/campuses`, { accessToken }),
	get: (accessToken: string, tenantId: string, campusId: string) =>
		apiClient.get<{ campus: Campus }>(`/tenants/${tenantId}/campuses/${campusId}`, {
			accessToken,
		}),
	create: (accessToken: string, tenantId: string, input: CreateCampusInput) =>
		apiClient.post<{ campus: Campus }>(`/tenants/${tenantId}/campuses`, input, { accessToken }),
	update: (
		accessToken: string,
		tenantId: string,
		campusId: string,
		input: Partial<CreateCampusInput> & { status?: Campus["status"] },
	) =>
		apiClient.patch<{ campus: Campus }>(`/tenants/${tenantId}/campuses/${campusId}`, input, {
			accessToken,
		}),
};
