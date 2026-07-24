"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { navigationQueryKeys } from "../queries/navigation-query-keys";
import { navigationService } from "../services/navigation.service";

export function useAdminNavigationQuery(tenantId: string | null) {
	const { token } = useAuth();

	return useQuery({
		queryKey: navigationQueryKeys.admin(tenantId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			if (!token) throw new Error("Authentication required");
			return navigationService.getAdminNavigation(token, tenantId);
		},
		enabled: Boolean(token && tenantId),
		staleTime: 5 * 60_000,
		gcTime: 30 * 60_000,
	});
}
