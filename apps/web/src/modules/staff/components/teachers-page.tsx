"use client";

import { TeacherIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";
import { useTeachersQuery } from "../hooks/use-staff-queries";

export function TeachersPage() {
	const { activeTenant } = useTenantContext();
	const { can, isLoading: permissionsLoading } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const canRead = can(PermissionCodes.STAFF_READ);
	const query = useTeachersQuery(tenantId, canRead);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage teachers.</AlertDescription>
			</Alert>
		);
	}

	if (permissionsLoading) {
		return (
			<div className="flex min-h-[240px] items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	if (!canRead) {
		return (
			<Alert>
				<AlertDescription>You do not have permission to view teachers.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
			<header className="mb-6 border-dashboard-border border-b pb-5">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={TeacherIcon} size={20} strokeWidth={1.8} />
					</div>
					<div>
						<h1 className="font-semibold text-[24px] text-dashboard-text-primary">Teachers</h1>
						<p className="text-[13px] text-dashboard-text-muted">
							Staff profiles, homeroom sections, and subject assignments.
						</p>
					</div>
				</div>
			</header>

			{query.isLoading ? (
				<div className="flex justify-center py-10">
					<Spinner />
				</div>
			) : (
				<div className="overflow-hidden rounded-[14px] border border-dashboard-border">
					<table className="w-full text-[13px]">
						<thead className="bg-dashboard-surface-strong text-left text-[11px] text-dashboard-text-muted uppercase">
							<tr>
								<th className="px-4 py-2.5">Teacher</th>
								<th className="px-4 py-2.5">Employee code</th>
								<th className="px-4 py-2.5">Homeroom</th>
								<th className="px-4 py-2.5">Subjects</th>
							</tr>
						</thead>
						<tbody>
							{(query.data ?? []).map((teacher) => (
								<tr key={teacher.membershipId} className="border-dashboard-border-subtle border-t">
									<td className="px-4 py-3">
										<Link
											href={`/admin/teachers/${teacher.membershipId}`}
											className="font-medium hover:text-dashboard-accent"
										>
											{teacher.email}
										</Link>
										<div className="text-[12px] text-dashboard-text-muted">{teacher.role}</div>
									</td>
									<td className="px-4 py-3 text-dashboard-text-secondary">
										{teacher.profile.employeeCode ?? "—"}
									</td>
									<td className="px-4 py-3 tabular-nums">{teacher.homeroomSectionCount}</td>
									<td className="px-4 py-3 tabular-nums">{teacher.subjectAssignmentCount}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
