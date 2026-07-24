"use client";

import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAcademicYearsQuery, useClassesQuery, useSectionsQuery } from "@/modules/academic";
import { useAuth } from "@/modules/auth/context/auth-context";
import { useMembersQuery } from "@/modules/members/hooks/use-member-queries";
import { useTeachersQuery } from "@/modules/staff/hooks/use-staff-queries";
import { studentsService } from "@/modules/students/services/students.service";
import { useTenantContext } from "@/modules/tenants";
import { computeDashboardMetrics } from "../utils/dashboard-metrics.utils";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useDashboardMetricsQuery(enabled = true) {
	const { token } = useAuth();
	const { activeTenant, campuses } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;

	const yearsQuery = useAcademicYearsQuery(tenantId, enabled);
	const classesQuery = useClassesQuery(tenantId, enabled);
	const sectionsQuery = useSectionsQuery(tenantId, null, enabled);
	const teachersQuery = useTeachersQuery(tenantId, enabled);
	const membersQuery = useMembersQuery(tenantId, enabled);

	const [studentsQuery, enrollmentsQuery] = useQueries({
		queries: [
			{
				queryKey: ["dashboard", tenantId, "students"],
				queryFn: () => {
					if (!tenantId) throw new Error("Tenant id required");
					return studentsService
						.list(requireToken(token), tenantId)
						.then((response) => response.students);
				},
				enabled: enabled && Boolean(token && tenantId),
			},
			{
				queryKey: ["dashboard", tenantId, "enrollments"],
				queryFn: () => {
					if (!tenantId) throw new Error("Tenant id required");
					return studentsService
						.listEnrollments(requireToken(token), tenantId)
						.then((response) => response.enrollments);
				},
				enabled: enabled && Boolean(token && tenantId),
			},
		],
	});

	const isLoading =
		yearsQuery.isLoading ||
		classesQuery.isLoading ||
		sectionsQuery.isLoading ||
		teachersQuery.isLoading ||
		membersQuery.isLoading ||
		studentsQuery.isLoading ||
		enrollmentsQuery.isLoading;

	const isError =
		yearsQuery.isError ||
		classesQuery.isError ||
		sectionsQuery.isError ||
		teachersQuery.isError ||
		membersQuery.isError ||
		studentsQuery.isError ||
		enrollmentsQuery.isError;

	const metrics = useMemo(() => {
		if (
			!studentsQuery.data ||
			!enrollmentsQuery.data ||
			!classesQuery.data ||
			!sectionsQuery.data ||
			!teachersQuery.data
		) {
			return null;
		}

		const activeYear =
			yearsQuery.data?.find((year) => year.status === "active") ?? yearsQuery.data?.[0] ?? null;

		return computeDashboardMetrics({
			students: studentsQuery.data,
			enrollments: enrollmentsQuery.data,
			classes: classesQuery.data,
			sections: sectionsQuery.data,
			teachers: teachersQuery.data,
			memberSummary: membersQuery.data?.summary ?? null,
			campuses,
			activeYearLabel: activeYear?.name ?? "Current term",
		});
	}, [
		studentsQuery.data,
		enrollmentsQuery.data,
		classesQuery.data,
		sectionsQuery.data,
		teachersQuery.data,
		membersQuery.data?.summary,
		campuses,
		yearsQuery.data,
	]);

	return {
		metrics,
		isLoading,
		isError,
		tenantName: activeTenant?.name ?? null,
		campuses,
	};
}
