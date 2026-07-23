"use client";

import { Calendar03Icon, TeacherIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useMemo } from "react";
import { FadeIn } from "@/app/admin/_components/dashboard/fade-in";
import { useClassesQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { useAuth } from "@/modules/auth/context/auth-context";
import { useMyTeacherProfileQuery } from "@/modules/staff/hooks/use-staff-queries";
import { useTenantContext } from "@/modules/tenants";

export function TeacherDashboard() {
	const { user } = useAuth();
	const { activeTenant, campuses } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const profileQuery = useMyTeacherProfileQuery(tenantId);
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
				<AlertDescription>Switch to an organization to view your dashboard.</AlertDescription>
			</Alert>
		);
	}

	if (profileQuery.isLoading || classesQuery.isLoading) {
		return (
			<div className="flex min-h-[320px] items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (profileQuery.isError || !profileQuery.data) {
		return (
			<Alert>
				<AlertDescription>
					Your teacher dashboard is available when you are signed in as a teacher for this
					organization.
				</AlertDescription>
			</Alert>
		);
	}

	const { teacher, homeroomSections, subjectAssignments } = profileQuery.data;
	const homeroomCount = homeroomSections.length;
	const subjectCount = subjectAssignments.length;
	const greetingName = user?.username ?? teacher.email.split("@")[0] ?? "teacher";

	return (
		<div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 px-3 py-3 sm:space-y-5 sm:px-6 sm:py-6 lg:space-y-6 lg:px-8">
			<FadeIn>
				<section className="border-dashboard-border border-b pb-4 sm:pb-5">
					<div className="mb-1.5 flex items-center gap-2 text-[11px] text-dashboard-text-muted uppercase tracking-[0.08em]">
						<span className="size-1.5 rounded-full bg-emerald-500" />
						<span>Teacher home · {activeTenant?.name ?? "Organization"}</span>
					</div>
					<h1 className="font-semibold text-[22px] text-dashboard-text-primary tracking-tight sm:text-[24px]">
						Welcome back, {greetingName}
					</h1>
					<p className="mt-1.5 text-[13px] text-dashboard-text-secondary">
						{homeroomCount} homeroom section{homeroomCount === 1 ? "" : "s"} · {subjectCount}{" "}
						subject assignment{subjectCount === 1 ? "" : "s"}
					</p>
				</section>
			</FadeIn>

			<FadeIn delay={0.06}>
				<div className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4">
						<p className="text-[11px] text-dashboard-text-muted uppercase tracking-wide">
							Homeroom sections
						</p>
						<p className="mt-1 font-semibold text-[28px] text-dashboard-text-primary">
							{homeroomCount}
						</p>
					</div>
					<div className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4">
						<p className="text-[11px] text-dashboard-text-muted uppercase tracking-wide">
							Subject classes
						</p>
						<p className="mt-1 font-semibold text-[28px] text-dashboard-text-primary">
							{subjectCount}
						</p>
					</div>
					<div className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4">
						<p className="text-[11px] text-dashboard-text-muted uppercase tracking-wide">
							Quick action
						</p>
						<Button
							variant="outline"
							className="mt-2"
							nativeButton={false}
							render={<Link href="/admin/attendance" />}
						>
							<HugeiconsIcon icon={Calendar03Icon} size={16} className="mr-2" />
							Mark attendance
						</Button>
					</div>
				</div>
			</FadeIn>

			<FadeIn delay={0.1}>
				<section className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4 sm:p-5">
					<div className="mb-4 flex items-center gap-2">
						<HugeiconsIcon icon={TeacherIcon} size={18} className="text-dashboard-accent" />
						<h2 className="font-medium text-[16px]">Homeroom sections</h2>
					</div>
					{homeroomSections.length === 0 ? (
						<p className="text-[13px] text-dashboard-text-muted">
							No homeroom sections are assigned to you yet. Ask an administrator to assign you as
							homeroom teacher.
						</p>
					) : (
						<div className="grid gap-3 sm:grid-cols-2">
							{homeroomSections.map((section) => (
								<div
									key={section.id}
									className="rounded-[12px] border border-dashboard-border-subtle bg-dashboard-surface-elevated p-4"
								>
									<p className="font-medium text-[14px]">
										{formatSectionLabel(
											section,
											classNameById.get(section.classId),
											campusNameById.get(section.campusId),
										)}
									</p>
									<Badge variant="outline" className="mt-2">
										Homeroom
									</Badge>
									<Link
										href="/admin/attendance"
										className="mt-2 inline-block text-[13px] text-dashboard-accent underline-offset-2 hover:underline"
									>
										Open attendance
									</Link>
								</div>
							))}
						</div>
					)}
				</section>
			</FadeIn>

			<FadeIn delay={0.14}>
				<section className="overflow-hidden rounded-[14px] border border-dashboard-border bg-dashboard-surface">
					<div className="border-dashboard-border-subtle border-b px-4 py-3 sm:px-5">
						<h2 className="font-medium text-[16px]">Subject assignments</h2>
					</div>
					<table className="w-full text-[13px]">
						<thead className="bg-dashboard-surface-strong text-left text-[11px] text-dashboard-text-muted uppercase">
							<tr>
								<th className="px-4 py-2.5 sm:px-5">Section</th>
								<th className="px-4 py-2.5 sm:px-5">Subject</th>
							</tr>
						</thead>
						<tbody>
							{subjectAssignments.length === 0 ? (
								<tr>
									<td colSpan={2} className="px-4 py-6 text-dashboard-text-muted sm:px-5">
										No subject assignments yet.
									</td>
								</tr>
							) : (
								subjectAssignments.map((item) => (
									<tr key={item.id} className="border-dashboard-border-subtle border-t">
										<td className="px-4 py-3 sm:px-5">{item.sectionName}</td>
										<td className="px-4 py-3 sm:px-5">
											{item.subjectName}{" "}
											<span className="text-dashboard-text-muted">({item.subjectCode})</span>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</section>
			</FadeIn>
		</div>
	);
}
