"use client";

import { useMemo } from "react";
import { useAuth } from "@/modules/auth/context/auth-context";
import type { PermissionCode } from "../constants/permission-codes";
import { useTenantContext } from "../context/tenant-context";
import { useTenantMembershipQuery } from "./use-tenant-membership-query";

export function usePermissions() {
	const { tenantContext: sessionContext } = useAuth();
	const { activeTenant } = useTenantContext();
	const activeTenantId = activeTenant?.id ?? null;

	const sessionMatchesTenant =
		sessionContext?.tenantId != null && sessionContext.tenantId === activeTenantId;
	const membershipQuery = useTenantMembershipQuery(
		activeTenantId,
		Boolean(activeTenantId && !sessionMatchesTenant),
	);

	const access = useMemo(() => {
		if (sessionMatchesTenant && sessionContext) return sessionContext;
		if (membershipQuery.data?.tenantId === activeTenantId) return membershipQuery.data;
		return null;
	}, [activeTenantId, membershipQuery.data, sessionContext, sessionMatchesTenant]);

	return {
		role: access?.role ?? null,
		permissions: access?.permissions ?? [],
		can: (permission: PermissionCode) => access?.permissions.includes(permission) ?? false,
		isLoading: Boolean(activeTenantId && !access && membershipQuery.isLoading),
	};
}
