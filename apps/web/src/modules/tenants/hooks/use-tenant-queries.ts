"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { tenantQueryKeys } from "../queries/tenant-query-keys";
import { campusesService } from "../services/campuses.service";
import { tenantsService } from "../services/tenants.service";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useTenantsQuery(enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: tenantQueryKeys.list(),
		queryFn: () => tenantsService.list(requireToken(token)).then((r) => r.tenants),
		enabled: enabled && Boolean(token),
	});
}

export function useTenantQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: tenantQueryKeys.detail(tenantId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return tenantsService.get(requireToken(token), tenantId).then((r) => r.tenant);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useCampusesQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: tenantQueryKeys.campuses(tenantId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return campusesService.list(requireToken(token), tenantId).then((r) => r.campuses);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}
