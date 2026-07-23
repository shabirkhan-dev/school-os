"use client";

import { useCallback } from "react";
import { selectPermissionsLoading, useSessionStore } from "@/store";
import type { PermissionCode } from "../constants/permission-codes";

export function usePermissions() {
	const role = useSessionStore((state) => state.membership?.role ?? null);
	const permissions = useSessionStore((state) => state.membership?.permissions ?? []);
	const isLoading = useSessionStore(selectPermissionsLoading);
	const can = useCallback(
		(permission: PermissionCode) => permissions.includes(permission),
		[permissions],
	);

	return {
		role,
		permissions,
		can,
		isLoading,
	};
}
