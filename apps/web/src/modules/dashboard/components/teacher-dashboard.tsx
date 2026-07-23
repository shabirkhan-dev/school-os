"use client";

import { TeacherIcon } from "@hugeicons/core-free-icons";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useMemo } from "react";
import { FadeIn } from "@/app/admin/_components/dashboard/fade-in";
import { AdminPageShell } from "@/components/admin";
import { useClassesQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { TeacherClassCard } from "@/modules/staff/components/teacher-class-card";
import { TeacherDashboardAlerts } from "@/modules/staff/components/teacher-dashboard-alerts";
import { TeacherPriorityActions } from "@/modules/staff/components/teacher-priority-actions";
import { TeacherQuickActions } from "@/modules/staff/components/teacher-quick-actions";
import { TeacherTodayOverview } from "@/modules/staff/components/teacher-today-overview";
import { useMyTeacherDashboardQuery } from "@/modules/staff/hooks/use-staff-queries";
import { useTenantContext } from "@/modules/tenants";
import { TeacherTodaySchedule } from "@/modules/timetable";
import { useSessionStore } from "@/store";

function localSessionDate(): string {
	return new Date().toLocaleDateString("en-CA");
}

function greetingForHour(hour: number): string {
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}

export function TeacherDashboard() {
	const user = useSessionStore((state) => state.user);
	const { activeTenant, campuses } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const sessionDate = localSessionDate();
	const dashboardQuery = useMyTeacherDashboardQuery(tenantId, sessionDate);
	const classesQuery = useClassesQuery(tenantId, Boolean(tenantId));

	const classNameById = useMemo(
		() => new Map((classesQuery.data ?? []).map((item) => [item.id, item.name])),
		[classesQuery.data],
	);
	const campusNameById = useMemo(
		() => new Map(campuses.map((campus) => [campus.id, campus.name])),
		[campuses],
	);

	const sectionMetricsByKey = useMemo(() => {
		const map = new Map<string, NonNullable<typeof dashboardQuery.data>["sections"][number]>();
		for (const item of dashboardQuery.data?.sections ?? []) {
			const key = `${item.section.id}-${item.section.subjectId ?? "homeroom"}`;
			map.set(key, item);
		}
		return map;
	}, [dashboardQuery.data?.sections]);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Switch to an organization to view your dashboard.</AlertDescription>
			</Alert>
		);
	}

	if (dashboardQuery.isLoading || classesQuery.isLoading) {
		return (
			<div className="flex min-h-[320px] items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (dashboardQuery.isError || !dashboardQuery.data) {
		return (
			<Alert>
				<AlertDescription>
					Your teacher dashboard is available when you are signed in as a teacher for this
					organization.
				</AlertDescription>
			</Alert>
		);
	}

	const { teacher, stats, priorityActions, sections, todaySchedule, alerts } = dashboardQuery.data;
	const greetingName = user?.username ?? teacher.email.split("@")[0] ?? "teacher";
	const firstPending = priorityActions.find((action) => action.type === "mark_attendance");
	const homeroomSections = sections.filter((item) => item.section.accessType === "homeroom");

	return (
		<AdminPageShell
			title={`${greetingForHour(new Date().getHours())}, ${greetingName}`}
			description={`Today · ${sessionDate} · ${activeTenant?.name ?? "Organization"}`}
			icon={TeacherIcon}
			maxWidth="7xl"
			className="px-3 sm:px-6 lg:px-8"
		>
			<FadeIn delay={0.03}>
				<section className="mb-6">
					<h2 className="mb-3 font-medium text-[15px] text-foreground">Today</h2>
					<TeacherTodayOverview stats={stats} />
				</section>
			</FadeIn>

			<FadeIn delay={0.05}>
				<TeacherQuickActions
					sessionDate={sessionDate}
					firstPendingSectionId={firstPending?.sectionId}
					homeroomCount={stats.homeroomCount}
					className="mb-6"
				/>
			</FadeIn>

			{alerts.length > 0 ? (
				<FadeIn delay={0.07}>
					<TeacherDashboardAlerts alerts={alerts} className="mb-6" />
				</FadeIn>
			) : null}

			{priorityActions.length > 0 ? (
				<FadeIn delay={0.08}>
					<TeacherPriorityActions
						actions={priorityActions}
						sessionDate={sessionDate}
						className="mb-6"
					/>
				</FadeIn>
			) : null}

			<FadeIn delay={0.1}>
				<section className="mb-8">
					<div className="mb-3 flex items-center justify-between gap-3">
						<div>
							<h2 className="font-medium text-[16px] text-foreground">Today&apos;s periods</h2>
							<p className="mt-0.5 text-[13px] text-muted-foreground">
								Scheduled classes with times, subjects, and rooms.
							</p>
						</div>
						<Link href="/admin/timetable" className="text-[13px] text-primary hover:underline">
							Full week
						</Link>
					</div>
					<TeacherTodaySchedule schedule={todaySchedule} classNameById={classNameById} compact />
				</section>
			</FadeIn>

			<FadeIn delay={0.12}>
				<section>
					<div className="mb-3 flex items-center justify-between gap-3">
						<div>
							<h2 className="font-medium text-[16px] text-foreground">Your classes</h2>
							<p className="mt-0.5 text-[13px] text-muted-foreground">
								Homeroom attendance and roster links for {sessionDate}.
							</p>
						</div>
						<Link href="/admin/my-classes" className="text-[13px] text-primary hover:underline">
							View all
						</Link>
					</div>

					{sections.length === 0 ? (
						<p className="rounded-xl border border-border border-dashed px-4 py-10 text-center text-[13px] text-muted-foreground">
							No classes assigned yet. Contact your administrator to assign homeroom or subject
							classes.
						</p>
					) : (
						<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
							{homeroomSections.map((item) => {
								const key = `${item.section.id}-${item.section.subjectId ?? "homeroom"}`;
								return (
									<TeacherClassCard
										key={key}
										section={item.section}
										label={formatSectionLabel(
											item.section,
											classNameById.get(item.section.classId),
											campusNameById.get(item.section.campusId),
										)}
										campusName={campusNameById.get(item.section.campusId)}
										metrics={sectionMetricsByKey.get(key) ?? item}
									/>
								);
							})}
							{sections
								.filter((item) => item.section.accessType === "subject")
								.map((item) => {
									const key = `${item.section.id}-${item.section.subjectId ?? "homeroom"}`;
									return (
										<TeacherClassCard
											key={key}
											section={item.section}
											label={formatSectionLabel(
												item.section,
												classNameById.get(item.section.classId),
												campusNameById.get(item.section.campusId),
											)}
											campusName={campusNameById.get(item.section.campusId)}
											metrics={sectionMetricsByKey.get(key) ?? item}
										/>
									);
								})}
						</div>
					)}
				</section>
			</FadeIn>
		</AdminPageShell>
	);
}
