"use client";

import { useCallback } from "react";
import { selectPermissionsLoading, useSessionStore } from "@/store";
import type { PermissionCode } from "../constants/permission-codes";

/** Stable empty array to avoid new reference on every render (Zustand infinite loop). */
const EMPTY_PERMISSIONS: readonly PermissionCode[] = [];

export function usePermissions() {
	const role = useSessionStore((state) => state.membership?.role ?? null);
	const permissions = useSessionStore(
		(state) => state.membership?.permissions ?? EMPTY_PERMISSIONS,
	);
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
