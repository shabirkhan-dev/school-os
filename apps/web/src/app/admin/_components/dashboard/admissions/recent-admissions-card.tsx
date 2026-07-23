"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardCardFooter, DashboardCardHeader, FooterSep } from "../card-chrome";
import { admissionSummary, admissions } from "./admissions-data";
import { AdmissionsTable } from "./admissions-table";
import { AdmissionsToolbar } from "./admissions-toolbar";

type Props = {
	className?: string;
};

export function RecentAdmissionsCard({ className }: Props) {
	const [query, setQuery] = useState("");
	const summary = useMemo(() => admissionSummary(admissions), []);

	const filteredCount = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return admissions.length;
		return admissions.filter((row) =>
			[
				row.id,
				row.student,
				row.email,
				row.grade,
				row.campus,
				row.guardian,
				row.status,
				row.note,
			].some((field) => field.toLowerCase().includes(q)),
		).length;
	}, [query]);

	return (
		<section
			className={cn(
				"flex w-full flex-col overflow-hidden rounded-[16px] border border-dashboard-border bg-dashboard-surface shadow-(--dashboard-shadow-card)",
				className,
			)}
			aria-label="Recent admissions"
		>
			<DashboardCardHeader
				title="Recent Admissions"
				description="Applications across campuses with guardian context, source, and review notes."
				meta={`Showing ${filteredCount} of ${summary.total} · updated a few minutes ago`}
				info="Search filters this list only. Status updates sync once SIS webhooks confirm."
				actions={<AdmissionsToolbar query={query} onQueryChange={setQuery} className="w-full" />}
			/>

			<div className="shrink-0">
				<AdmissionsTable query={query} />
			</div>

			<DashboardCardFooter
				className="shrink-0"
				action={
					<Button
						type="button"
						variant="link"
						size="sm"
						className="h-auto gap-1 p-0 font-medium text-[12px] text-dashboard-accent hover:text-dashboard-accent-hover"
					>
						View all admissions
						<HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2} />
					</Button>
				}
			>
				<span>
					<span className="font-semibold text-dashboard-text-secondary">{summary.pending}</span>{" "}
					pending review
				</span>
				<FooterSep />
				<span>
					<span className="font-semibold text-dashboard-text-secondary">{summary.waitlisted}</span>{" "}
					waitlisted
				</span>
				<FooterSep />
				<span>
					<span className="font-semibold text-dashboard-text-secondary">{summary.enrolled}</span>{" "}
					enrolled this week
				</span>
			</DashboardCardFooter>
		</section>
	);
}
