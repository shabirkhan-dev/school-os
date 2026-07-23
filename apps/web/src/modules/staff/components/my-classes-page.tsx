"use client";

import { TeacherIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Spinner } from "@school-os/ui/components/spinner";
import { useMemo } from "react";
import { useClassesQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { useTenantContext } from "@/modules/tenants";
import { useMyTeacherProfileQuery } from "../hooks/use-staff-queries";

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

	const data = query.data;

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
			<header className="mb-6 border-dashboard-border border-b pb-5">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={TeacherIcon} size={20} strokeWidth={1.8} />
					</div>
					<div>
						<h1 className="font-semibold text-[24px] text-dashboard-text-primary">My classes</h1>
						<p className="text-[13px] text-dashboard-text-muted">
							Homeroom sections and subjects assigned to you.
						</p>
					</div>
				</div>
			</header>

			<section className="mb-6">
				<h2 className="mb-3 font-medium text-[14px]">Homeroom sections</h2>
				<div className="grid gap-3 sm:grid-cols-2">
					{(data?.homeroomSections ?? []).length === 0 ? (
						<p className="text-[13px] text-dashboard-text-muted">
							No homeroom sections assigned yet.
						</p>
					) : (
						data?.homeroomSections.map((section) => (
							<div
								key={section.id}
								className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4"
							>
								<div className="font-medium">
									{formatSectionLabel(
										section,
										classNameById.get(section.classId),
										campusNameById.get(section.campusId),
									)}
								</div>
								<Badge variant="outline" className="mt-2">
									Homeroom
								</Badge>
							</div>
						))
					)}
				</div>
			</section>

			<section>
				<h2 className="mb-3 font-medium text-[14px]">Subject assignments</h2>
				<div className="overflow-hidden rounded-[14px] border border-dashboard-border">
					<table className="w-full text-[13px]">
						<thead className="bg-dashboard-surface-strong text-left text-[11px] text-dashboard-text-muted uppercase">
							<tr>
								<th className="px-4 py-2.5">Section</th>
								<th className="px-4 py-2.5">Subject</th>
							</tr>
						</thead>
						<tbody>
							{(data?.subjectAssignments ?? []).map((item) => {
								const section = data?.homeroomSections.find((row) => row.id === item.sectionId);
								const sectionLabel = section
									? formatSectionLabel(
											section,
											classNameById.get(section.classId),
											campusNameById.get(section.campusId),
										)
									: item.sectionName;
								return (
									<tr key={item.id} className="border-dashboard-border-subtle border-t">
										<td className="px-4 py-3">{sectionLabel}</td>
										<td className="px-4 py-3">
											{item.subjectName}{" "}
											<span className="text-dashboard-text-muted">({item.subjectCode})</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</section>
		</div>
	);
}
