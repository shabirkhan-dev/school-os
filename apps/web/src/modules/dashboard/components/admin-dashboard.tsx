"use client";

import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Spinner } from "@school-os/ui/components/spinner";
import { RecentAdmissionsCard } from "@/app/admin/_components/dashboard/admissions/recent-admissions-card";
import { DashboardHeader } from "@/app/admin/_components/dashboard/dashboard-header";
import { EnrollmentTrendCard } from "@/app/admin/_components/dashboard/enrollment-trend/enrollment-trend-card";
import { FadeIn } from "@/app/admin/_components/dashboard/fade-in";
import { GradeDistributionCard } from "@/app/admin/_components/dashboard/grade-distribution/grade-distribution-card";
import { OpsPulseStrip } from "@/app/admin/_components/dashboard/ops-pulse-strip";
import { StatCardsRow } from "@/app/admin/_components/dashboard/stat-cards-row";
import { useDashboardMetricsQuery } from "../hooks/use-dashboard-queries";

type Props = {
	enabled?: boolean;
};

export function AdminDashboard({ enabled = true }: Props) {
	const { metrics, isLoading, isError, tenantName, campuses } = useDashboardMetricsQuery(enabled);

	if (isError) {
		return (
			<Alert variant="destructive">
				<AlertDescription>Could not load dashboard data. Refresh to try again.</AlertDescription>
			</Alert>
		);
	}

	if (isLoading || !metrics) {
		return (
			<div className="flex min-h-[320px] items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-4 px-3 py-3 sm:space-y-5 sm:px-6 sm:py-6 lg:space-y-6 lg:px-8">
			<FadeIn>
				<DashboardHeader tenantName={tenantName} campuses={campuses} insights={metrics.insights} />
			</FadeIn>
			<FadeIn delay={0.04}>
				<OpsPulseStrip items={metrics.opsPulse} />
			</FadeIn>
			<FadeIn delay={0.08}>
				<StatCardsRow stats={metrics.stats} />
			</FadeIn>
			<div className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-12">
				<FadeIn delay={0.12} className="min-w-0 xl:col-span-8">
					<EnrollmentTrendCard months={metrics.enrollmentMonths} insights={metrics.insights} />
				</FadeIn>
				<FadeIn delay={0.16} className="min-w-0 xl:col-span-4">
					<GradeDistributionCard grades={metrics.gradeRows} insights={metrics.insights} />
				</FadeIn>
			</div>
			<FadeIn delay={0.2} className="min-w-0">
				<RecentAdmissionsCard
					admissions={metrics.recentAdmissions}
					summary={metrics.admissionSummary}
					updatedAt={metrics.insights.updatedAt}
				/>
			</FadeIn>
		</div>
	);
}
