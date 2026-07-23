"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { tenantQueryKeys } from "../queries/tenant-query-keys";
import { tenantsService } from "../services/tenants.service";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useTenantMembershipQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: tenantQueryKeys.membership(tenantId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return tenantsService.getMembership(requireToken(token), tenantId).then((r) => r.membership);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}
