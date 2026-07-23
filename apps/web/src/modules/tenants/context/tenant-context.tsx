"use client";

import type { ReactNode } from "react";
import { selectActiveCampus, selectActiveTenant, useSessionStore } from "@/store";

type TenantContextValue = {
	tenants: ReturnType<typeof useSessionStore.getState>["tenants"];
	tenantsLoading: boolean;
	activeTenant: ReturnType<typeof selectActiveTenant>;
	activeCampus: ReturnType<typeof selectActiveCampus>;
	campuses: ReturnType<typeof useSessionStore.getState>["campuses"];
	campusesLoading: boolean;
	tenantSwitching: boolean;
	setActiveTenantId: (tenantId: string) => void;
	setActiveCampusId: (campusId: string) => void;
	refreshTenants: () => void;
};

/** @deprecated Tenant state lives in the session store; provider is a no-op for compatibility. */
export function TenantProvider({ children }: { children: ReactNode }) {
	return children;
}

export function useTenantContext(): TenantContextValue {
	const tenants = useSessionStore((state) => state.tenants);
	const tenantsLoading = useSessionStore((state) => state.tenantsLoading);
	const campuses = useSessionStore((state) => state.campuses);
	const campusesLoading = useSessionStore((state) => state.campusesLoading);
	const tenantSwitching = useSessionStore((state) => state.tenantSwitching);
	const activeTenant = useSessionStore(selectActiveTenant);
	const activeCampus = useSessionStore(selectActiveCampus);
	const setActiveTenantId = useSessionStore((state) => state.setActiveTenantId);
	const setActiveCampusId = useSessionStore((state) => state.setActiveCampusId);

	return {
		tenants,
		tenantsLoading,
		activeTenant,
		activeCampus,
		campuses,
		campusesLoading,
		tenantSwitching,
		setActiveTenantId,
		setActiveCampusId,
		refreshTenants: () => {
			// SessionProvider reloads tenants when token/user changes; trigger via store flag if needed later.
		},
	};
}
