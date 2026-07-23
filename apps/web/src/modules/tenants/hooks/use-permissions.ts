"use client";

import { useMemo } from "react";
import { useAuth } from "@/modules/auth/context/auth-context";
import { normalizeTenantContext } from "@/modules/auth/lib/normalize-tenant-context";
import type { PermissionCode } from "../constants/permission-codes";
import { useTenantContext } from "../context/tenant-context";
import { useTenantMembershipQuery } from "./use-tenant-membership-query";

export function usePermissions() {
	const { tenantContext: sessionContext } = useAuth();
	const { activeTenant, tenantSwitching } = useTenantContext();
	const activeTenantId = activeTenant?.id ?? null;

	const normalizedSession = useMemo(
		() => normalizeTenantContext(sessionContext ?? undefined),
		[sessionContext],
	);

	const sessionMatchesTenant =
		normalizedSession?.tenantId != null && normalizedSession.tenantId === activeTenantId;

	const membershipQuery = useTenantMembershipQuery(
		activeTenantId,
		Boolean(activeTenantId && !tenantSwitching),
	);

	const access = useMemo(() => {
		if (membershipQuery.data?.tenantId === activeTenantId) return membershipQuery.data;
		if (sessionMatchesTenant && normalizedSession) return normalizedSession;
		return null;
	}, [activeTenantId, membershipQuery.data, normalizedSession, sessionMatchesTenant]);

	return {
		role: access?.role ?? null,
		permissions: access?.permissions ?? [],
		can: (permission: PermissionCode) => access?.permissions.includes(permission) ?? false,
		isLoading: Boolean(activeTenantId && (tenantSwitching || membershipQuery.isLoading)) && !access,
	};
}
