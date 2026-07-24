"use client";

import { BookOpen02Icon, Calendar03Icon, StudentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useHomeworkListQuery } from "@/modules/homework/hooks/use-homework-queries";
import { StudentIdCard } from "@/modules/students/components/student-id-card";
import { useMyStudentProfileQuery } from "@/modules/students/hooks/use-student-queries";
import { useTenantContext } from "@/modules/tenants";
import { useDashboardI18n } from "../i18n/dashboard-i18n-provider";

export function StudentDashboard() {
	const { t, intlLocale } = useDashboardI18n();
	const { activeTenant, campuses } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const profileQuery = useMyStudentProfileQuery(tenantId);
	const homeworkQuery = useHomeworkListQuery(tenantId, { status: "published" });

	const formatDue = (value: string | null) => {
		if (!value) return t("student.noDueDate");
		return new Date(value).toLocaleString(intlLocale, { dateStyle: "medium", timeStyle: "short" });
	};

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>{t("student.selectOrg")}</AlertDescription>
			</Alert>
		);
	}

	if (profileQuery.isLoading) {
		return (
			<div className="flex min-h-[320px] items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (profileQuery.isError || !profileQuery.data) {
		return (
			<Alert variant="destructive">
				<AlertDescription>
					{profileQuery.error instanceof Error
						? profileQuery.error.message
						: t("student.profileError")}
				</AlertDescription>
			</Alert>
		);
	}

	const profile = profileQuery.data;
	const { student } = profile;
	const campus = campuses.find((row) => row.id === student.campusId);
	const published = (homeworkQuery.data ?? [])
		.filter((row) => row.status === "published")
		.slice(0, 5);

	return (
		<div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
			<header className="border-dashboard-border border-b pb-5">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={StudentIcon} size={20} strokeWidth={1.8} />
					</div>
					<div>
						<h1 className="font-semibold text-[24px] text-dashboard-text-primary">
							{t("student.mySchool")}
						</h1>
						<p className="text-dashboard-text-muted text-sm">
							{campus?.name ?? t("student.yourCampus")} · {student.studentCode}
						</p>
					</div>
				</div>
			</header>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
				<section className="space-y-4">
					<div className="flex items-center justify-between gap-2">
						<h2 className="font-medium text-dashboard-text-primary text-lg">
							{t("student.homeworkDue")}
						</h2>
						<Button variant="outline" size="sm" render={<Link href="/admin/homework" />}>
							{t("student.allHomework")}
						</Button>
					</div>
					{homeworkQuery.isLoading ? (
						<div className="flex justify-center py-8">
							<Spinner />
						</div>
					) : published.length === 0 ? (
						<p className="rounded-lg border border-dashboard-border border-dashed px-4 py-8 text-center text-dashboard-text-muted text-sm">
							{t("student.noHomework")}
						</p>
					) : (
						<ul className="divide-y divide-dashboard-border rounded-lg border border-dashboard-border bg-dashboard-surface">
							{published.map((item) => (
								<li
									key={item.id}
									className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
								>
									<div className="flex min-w-0 items-start gap-3">
										<HugeiconsIcon
											icon={BookOpen02Icon}
											size={18}
											className="mt-0.5 shrink-0 text-dashboard-accent"
										/>
										<div className="min-w-0">
											<p className="truncate font-medium text-dashboard-text-primary text-sm">
												{item.title}
											</p>
											<p className="text-dashboard-text-muted text-xs">{formatDue(item.dueAt)}</p>
										</div>
									</div>
									<Badge variant="secondary">{item.status}</Badge>
								</li>
							))}
						</ul>
					)}

					<div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashboard-border bg-dashboard-surface px-4 py-3 text-dashboard-text-muted text-sm">
						<HugeiconsIcon icon={Calendar03Icon} size={18} />
						<span>{t("student.testsHint")}</span>
						<Link
							href="/admin/assessments"
							className="text-dashboard-accent underline-offset-2 hover:underline"
						>
							{t("student.testsLink")}
						</Link>
					</div>
				</section>

				<aside>
					<StudentIdCard
						student={student}
						schoolName={campus?.name ?? activeTenant?.name ?? t("common.school")}
						tenantId={student.tenantId}
						sectionLabel={
							profile.activeEnrollment ? t("student.enrolled") : t("student.notEnrolled")
						}
					/>
				</aside>
			</div>
		</div>
	);
}
