import { apiClient } from "@/lib/api/client";
import type { NavigationResponse } from "../types/navigation.types";

export const navigationService = {
	getAdminNavigation: (accessToken: string, tenantId: string) =>
		apiClient.get<NavigationResponse>(`/tenants/${tenantId}/navigation`, { accessToken }),
};
