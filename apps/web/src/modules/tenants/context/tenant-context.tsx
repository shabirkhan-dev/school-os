"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useAuth } from "@/modules/auth/context/auth-context";
import { useCampusesQuery, useTenantsQuery } from "../hooks/use-tenant-queries";
import type { Campus, Tenant } from "../types/tenant.types";

const TENANT_STORAGE_KEY = "school-os.active-tenant-id";
const CAMPUS_STORAGE_KEY = "school-os.active-campus-id";

type TenantContextValue = {
	tenants: Tenant[];
	tenantsLoading: boolean;
	activeTenant: Tenant | null;
	activeCampus: Campus | null;
	campuses: Campus[];
	campusesLoading: boolean;
	setActiveTenantId: (tenantId: string) => void;
	setActiveCampusId: (campusId: string) => void;
	refreshTenants: () => void;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
	const { token, user } = useAuth();
	const tenantsQuery = useTenantsQuery(Boolean(token && user));
	const [activeTenantId, setActiveTenantIdState] = useState<string | null>(null);
	const [activeCampusId, setActiveCampusIdState] = useState<string | null>(null);

	const tenants = tenantsQuery.data ?? [];
	const campusesQuery = useCampusesQuery(activeTenantId, Boolean(token && activeTenantId));
	const campuses = campusesQuery.data ?? [];

	useEffect(() => {
		if (!tenants.length) {
			setActiveTenantIdState(null);
			setActiveCampusIdState(null);
			return;
		}

		const storedTenantId = readStoredId(TENANT_STORAGE_KEY);
		const tenant = tenants.find((t) => t.id === storedTenantId) ?? tenants[0] ?? null;
		setActiveTenantIdState(tenant?.id ?? null);
	}, [tenants]);

	useEffect(() => {
		if (!campuses.length) {
			setActiveCampusIdState(null);
			return;
		}

		const storedCampusId = readStoredId(CAMPUS_STORAGE_KEY);
		const campus = campuses.find((c) => c.id === storedCampusId) ?? campuses[0] ?? null;
		setActiveCampusIdState(campus?.id ?? null);
	}, [campuses]);

	const setActiveTenantId = useCallback((tenantId: string) => {
		setActiveTenantIdState(tenantId);
		writeStoredId(TENANT_STORAGE_KEY, tenantId);
		setActiveCampusIdState(null);
		writeStoredId(CAMPUS_STORAGE_KEY, null);
	}, []);

	const setActiveCampusId = useCallback((campusId: string) => {
		setActiveCampusIdState(campusId);
		writeStoredId(CAMPUS_STORAGE_KEY, campusId);
	}, []);

	const refreshTenants = useCallback(() => {
		void tenantsQuery.refetch();
	}, [tenantsQuery.refetch]);

	const value = useMemo(
		(): TenantContextValue => ({
			tenants,
			tenantsLoading: tenantsQuery.isLoading,
			activeTenant: tenants.find((t) => t.id === activeTenantId) ?? null,
			activeCampus: campuses.find((c) => c.id === activeCampusId) ?? null,
			campuses,
			campusesLoading: campusesQuery.isLoading,
			setActiveTenantId,
			setActiveCampusId,
			refreshTenants,
		}),
		[
			activeCampusId,
			activeTenantId,
			campuses,
			campusesQuery.isLoading,
			refreshTenants,
			setActiveCampusId,
			setActiveTenantId,
			tenants,
			tenantsQuery.isLoading,
		],
	);

	return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenantContext() {
	const context = useContext(TenantContext);
	if (!context) {
		throw new Error("useTenantContext must be used within TenantProvider");
	}
	return context;
}

function readStoredId(key: string): string | null {
	if (typeof window === "undefined") return null;
	return window.sessionStorage.getItem(key);
}

function writeStoredId(key: string, value: string | null) {
	if (typeof window === "undefined") return;
	if (value) window.sessionStorage.setItem(key, value);
	else window.sessionStorage.removeItem(key);
}
