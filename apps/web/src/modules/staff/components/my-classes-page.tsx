"use client";

import { TeacherIcon } from "@hugeicons/core-free-icons";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Spinner } from "@school-os/ui/components/spinner";
import { useMemo } from "react";
import { AdminPageShell } from "@/components/admin";
import { useClassesQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { useTenantContext } from "@/modules/tenants";
import { useMyTeacherProfileQuery } from "../hooks/use-staff-queries";
import { TeacherClassCard } from "./teacher-class-card";

export function MyClassesPage() {
	const { activeTenant, campuses } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const query = useMyTeacherProfileQuery(tenantId);
	const classesQuery = useClassesQuery(tenantId, Boolean(tenantId));

	const classNameById = useMemo(
		() => new Map((classesQuery.data ?? []).map((item) => [item.id, item.name])),
		[classesQuery.data],
	);
	const campusNameById = useMemo(
		() => new Map(campuses.map((campus) => [campus.id, campus.name])),
		[campuses],
	);

	const homeroomSections =
		query.data?.accessibleSections.filter((s) => s.accessType === "homeroom") ?? [];
	const subjectSections =
		query.data?.accessibleSections.filter((s) => s.accessType === "subject") ?? [];

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Switch to an organization to view your classes.</AlertDescription>
			</Alert>
		);
	}

	if (query.isLoading || classesQuery.isLoading) {
		return (
			<div className="flex justify-center py-10">
				<Spinner />
			</div>
		);
	}

	if (query.isError) {
		return (
			<Alert>
				<AlertDescription>My classes is available for teacher accounts.</AlertDescription>
			</Alert>
		);
	}

	return (
		<AdminPageShell
			title="My classes"
			description="Homeroom sections and subject classes assigned to you. Open a class to see the roster or mark attendance."
			icon={TeacherIcon}
			maxWidth="5xl"
		>
			<section className="mb-8">
				<h2 className="mb-3 font-medium text-[14px] text-dashboard-text-primary">Homeroom</h2>
				{homeroomSections.length === 0 ? (
					<p className="rounded-xl border border-dashboard-border border-dashed px-4 py-8 text-center text-[13px] text-dashboard-text-muted">
						No homeroom sections assigned yet. Ask an administrator to assign you as homeroom
						teacher.
					</p>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{homeroomSections.map((section) => (
							<TeacherClassCard
								key={section.id}
								section={section}
								label={formatSectionLabel(
									section,
									classNameById.get(section.classId),
									campusNameById.get(section.campusId),
								)}
								campusName={campusNameById.get(section.campusId)}
							/>
						))}
					</div>
				)}
			</section>

			<section>
				<h2 className="mb-3 font-medium text-[14px] text-dashboard-text-primary">
					Subject classes
				</h2>
				{subjectSections.length === 0 ? (
					<p className="rounded-xl border border-dashboard-border border-dashed px-4 py-8 text-center text-[13px] text-dashboard-text-muted">
						No subject assignments yet.
					</p>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{subjectSections.map((section) => (
							<TeacherClassCard
								key={`${section.id}-${section.subjectId}`}
								section={section}
								label={formatSectionLabel(
									section,
									classNameById.get(section.classId),
									campusNameById.get(section.campusId),
								)}
								campusName={campusNameById.get(section.campusId)}
							/>
						))}
					</div>
				)}
			</section>
		</AdminPageShell>
	);
}
