"use client";

import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FadeIn } from "@/app/admin/_components/dashboard/fade-in";
import { AdminPageShell } from "@/components/admin";
import { useClassesQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { TeacherClassCard } from "@/modules/staff/components/teacher-class-card";
import { TeacherCommandHero } from "@/modules/staff/components/teacher-command-hero";
import { TeacherFocusSidebar } from "@/modules/staff/components/teacher-focus-sidebar";
import { TeacherInstantActions } from "@/modules/staff/components/teacher-instant-actions";
import { TeacherOnboardingDialog } from "@/modules/staff/components/teacher-onboarding-dialog";
import { TeacherPreferencesSheet } from "@/modules/staff/components/teacher-preferences-sheet";
import { TeacherPriorityActions } from "@/modules/staff/components/teacher-priority-actions";
import { useMyTeacherDashboardQuery } from "@/modules/staff/hooks/use-staff-queries";
import {
	isTeacherOnboardingComplete,
	readTeacherOnboarding,
	type TeacherOnboardingPrefs,
} from "@/modules/staff/lib/teacher-onboarding.storage";
import { useTenantContext } from "@/modules/tenants";
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
	const [onboardingOpen, setOnboardingOpen] = useState(false);
	const [preferencesOpen, setPreferencesOpen] = useState(false);
	const [teacherPrefs, setTeacherPrefs] = useState<TeacherOnboardingPrefs | null>(null);

	useEffect(() => {
		setTeacherPrefs(readTeacherOnboarding());
	}, []);

	useEffect(() => {
		if (!dashboardQuery.data) return;
		if (isTeacherOnboardingComplete()) return;
		setOnboardingOpen(true);
	}, [dashboardQuery.data]);

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

	const { teacher, stats, priorityActions, sections, todaySchedule, alerts, morningDigest } =
		dashboardQuery.data;
	const greetingName = user?.username ?? teacher.email.split("@")[0] ?? "teacher";
	const firstPending = priorityActions.find((action) => action.type === "mark_attendance");
	const homeroomSections = sections.filter((item) => item.section.accessType === "homeroom");
	const subjectSections = sections.filter((item) => item.section.accessType === "subject");

	return (
		<AdminPageShell
			title="Home"
			description="Teacher command center"
			maxWidth="7xl"
			className="px-3 sm:px-6 lg:px-8"
		>
			<TeacherOnboardingDialog
				open={onboardingOpen}
				onOpenChange={setOnboardingOpen}
				classCount={sections.length}
				homeroomCount={homeroomSections.length}
				onCompleted={setTeacherPrefs}
			/>
			<TeacherPreferencesSheet
				open={preferencesOpen}
				onOpenChange={setPreferencesOpen}
				onSaved={setTeacherPrefs}
			/>
			<div className="sr-only">
				{greetingForHour(new Date().getHours())}, {greetingName}
			</div>

			<FadeIn delay={0.02}>
				<TeacherCommandHero
					greeting={greetingForHour(new Date().getHours())}
					displayName={greetingName}
					organizationName={activeTenant?.name ?? "Organization"}
					sessionDate={sessionDate}
					stats={stats}
					digest={morningDigest}
					preferences={teacherPrefs}
					className="mb-6"
				/>
			</FadeIn>

			<FadeIn delay={0.04}>
				<TeacherInstantActions
					sessionDate={sessionDate}
					stats={stats}
					digest={morningDigest}
					firstPending={firstPending}
					className="mb-8"
				/>
			</FadeIn>

			{priorityActions.length > 0 ? (
				<FadeIn delay={0.06}>
					<TeacherPriorityActions
						actions={priorityActions}
						sessionDate={sessionDate}
						className="mb-8"
					/>
				</FadeIn>
			) : null}

			<div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
				<FadeIn delay={0.08}>
					<section>
						<div className="mb-4 flex items-center justify-between gap-3">
							<div>
								<h2 className="font-medium text-[16px] text-foreground">Your classes</h2>
								<p className="mt-0.5 text-[13px] text-muted-foreground">
									Roster, ID cards, and classroom shortcuts
								</p>
							</div>
							<Link href="/admin/my-classes" className="text-[13px] text-primary hover:underline">
								View all
							</Link>
						</div>

						{sections.length === 0 ? (
							<p className="rounded-2xl border border-border border-dashed px-4 py-12 text-center text-[13px] text-muted-foreground">
								No classes assigned yet. Contact your administrator to assign homeroom or subject
								classes.
							</p>
						) : (
							<div className="space-y-6">
								{homeroomSections.length > 0 ? (
									<div>
										<p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
											Homeroom
										</p>
										<div className="grid gap-3 sm:grid-cols-2">
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
										</div>
									</div>
								) : null}
								{subjectSections.length > 0 ? (
									<div>
										<p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
											Subject classes
										</p>
										<div className="grid gap-3 sm:grid-cols-2">
											{subjectSections.map((item) => {
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
									</div>
								) : null}
							</div>
						)}
					</section>
				</FadeIn>

				<FadeIn delay={0.1}>
					<TeacherFocusSidebar
						todaySchedule={todaySchedule}
						classNameById={classNameById}
						alerts={alerts}
						digest={morningDigest}
						onOpenPreferences={() => setPreferencesOpen(true)}
						className="xl:sticky xl:top-4 xl:self-start"
					/>
				</FadeIn>
			</div>
		</AdminPageShell>
	);
}
