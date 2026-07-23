"use client";

import { ArrowLeft01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useMemo } from "react";
import { AdminPageShell } from "@/components/admin";
import {
	DataTable,
	type DataTableColumn,
	DataTableShell,
	defaultSortFn,
	useClientDataTable,
} from "@/components/data-table";
import { useClassesQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { useTenantContext } from "@/modules/tenants";
import { useMySectionStudentsQuery, useMyTeacherProfileQuery } from "../hooks/use-staff-queries";
import type { TeacherSectionStudent } from "../types/staff.types";

type Props = {
	sectionId: string;
};

export function ClassDetailPage({ sectionId }: Props) {
	const { activeTenant, campuses } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const profileQuery = useMyTeacherProfileQuery(tenantId);
	const studentsQuery = useMySectionStudentsQuery(tenantId, sectionId);
	const classesQuery = useClassesQuery(tenantId, Boolean(tenantId));

	const classNameById = useMemo(
		() => new Map((classesQuery.data ?? []).map((item) => [item.id, item.name])),
		[classesQuery.data],
	);
	const campusNameById = useMemo(
		() => new Map(campuses.map((campus) => [campus.id, campus.name])),
		[campuses],
	);

	const section = profileQuery.data?.accessibleSections.find((item) => item.id === sectionId);

	const columns = useMemo(
		(): DataTableColumn<TeacherSectionStudent>[] => [
			{
				id: "student",
				header: "Student",
				sortable: true,
				sortValue: (row) => row.student.fullName,
				cell: (row) => (
					<div>
						<p className="font-medium">{row.student.fullName}</p>
						<p className="text-[12px] text-dashboard-text-muted">{row.student.studentCode}</p>
					</div>
				),
			},
			{
				id: "contact",
				header: "Contact",
				cell: (row) => (
					<span className="text-dashboard-text-secondary">
						{row.student.email ?? row.student.phone ?? "—"}
					</span>
				),
			},
			{
				id: "status",
				header: "Status",
				sortable: true,
				sortValue: (row) => row.student.status,
				cell: (row) => <span className="capitalize">{row.student.status}</span>,
			},
		],
		[],
	);

	const table = useClientDataTable({
		data: studentsQuery.data ?? [],
		sortFn: (rows, sort) => defaultSortFn(rows, sort, columns),
	});

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Switch to an organization to view this class.</AlertDescription>
			</Alert>
		);
	}

	if (profileQuery.isLoading || classesQuery.isLoading) {
		return (
			<div className="flex min-h-[280px] items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	if (!section) {
		return (
			<Alert>
				<AlertDescription>
					This class is not assigned to you, or it no longer exists.
				</AlertDescription>
			</Alert>
		);
	}

	const sectionLabel = formatSectionLabel(
		section,
		classNameById.get(section.classId),
		campusNameById.get(section.campusId),
	);

	return (
		<AdminPageShell
			title={sectionLabel}
			description={
				section.accessType === "homeroom"
					? "Homeroom class roster and quick actions."
					: `${section.subjectName ?? "Subject"} class roster.`
			}
			breadcrumb={{ label: "My classes", href: "/admin/my-classes" }}
			actions={
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						nativeButton={false}
						render={<Link href="/admin/my-classes" />}
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" strokeWidth={2} />
						Back
					</Button>
					{section.accessType === "homeroom" ? (
						<Button
							size="sm"
							nativeButton={false}
							render={<Link href={`/admin/attendance?sectionId=${sectionId}`} />}
						>
							<HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" strokeWidth={2} />
							Mark attendance
						</Button>
					) : null}
				</div>
			}
		>
			<div className="mb-4 flex flex-wrap items-center gap-2">
				<Badge
					variant={section.accessType === "homeroom" ? "default" : "outline"}
					className="capitalize"
				>
					{section.accessType === "homeroom" ? "Homeroom" : section.subjectCode}
				</Badge>
				<span className="text-[13px] text-dashboard-text-muted">
					{table.totalRows} active student{table.totalRows === 1 ? "" : "s"}
				</span>
			</div>

			<DataTableShell>
				<DataTable
					borderless
					columns={columns}
					rows={table.rows}
					getRowId={(row) => row.student.id}
					loading={studentsQuery.isLoading}
					sort={table.sort}
					onSort={table.toggleSort}
					emptyTitle="No students enrolled"
					emptyDescription="Students appear here once enrolled in this section."
				/>
			</DataTableShell>
		</AdminPageShell>
	);
}
