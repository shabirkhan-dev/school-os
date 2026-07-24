"use client";

import { useEffect } from "react";
import { useMyStudentProfileQuery } from "@/modules/students/hooks/use-student-queries";
import { usePermissions, useTenantContext } from "@/modules/tenants";
import { useSessionStore } from "@/store";

/** Pins campus context for learners; parents stay organization-wide (no campus filter). */
export function RoleCampusScope() {
	const { role } = usePermissions();
	const { activeTenant } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const setActiveCampusId = useSessionStore((state) => state.setActiveCampusId);
	const profileQuery = useMyStudentProfileQuery(tenantId, role === "student");

	useEffect(() => {
		if (role !== "student") return;
		const campusId = profileQuery.data?.student.campusId;
		if (!campusId) return;
		setActiveCampusId(campusId);
	}, [profileQuery.data?.student.campusId, role, setActiveCampusId]);

	return null;
}
