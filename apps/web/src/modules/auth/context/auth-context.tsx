"use client";

import type { ReactNode } from "react";
import type { TenantMembership } from "@/modules/tenants";
import type { User } from "@/modules/users/types/user.types";
import {
	SessionProvider,
	selectPermissionsLoading,
	useSessionAuthActions,
	useSessionStore,
} from "@/store";

export function AuthProvider({ children }: { children: ReactNode }) {
	return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
	const token = useSessionStore((state) => state.token);
	const user = useSessionStore((state) => state.user);
	const tenantContext = useSessionStore((state) => state.tenantContext);
	const loading = useSessionStore((state) => state.authLoading);
	const error = useSessionStore((state) => state.authError);
	const actions = useSessionAuthActions();

	return {
		token,
		user,
		tenantContext,
		loading,
		error,
		...actions,
	};
}

export function useAuthUser(): User | null {
	return useSessionStore((state) => state.user);
}

export function useAuthToken(): string | null {
	return useSessionStore((state) => state.token);
}

export function useTenantMembership(): TenantMembership | null {
	return useSessionStore((state) => state.membership);
}

export function useAuthLoading(): boolean {
	return useSessionStore((state) => state.authLoading);
}

export function usePermissionsLoading(): boolean {
	return useSessionStore(selectPermissionsLoading);
}
