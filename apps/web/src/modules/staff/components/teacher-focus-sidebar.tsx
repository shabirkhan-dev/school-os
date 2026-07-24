"use client";

import { AlertCircleIcon, Calendar03Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { TeacherDaySchedule } from "@/modules/timetable";
import { TeacherTodaySchedule } from "@/modules/timetable";

import type { TeacherDashboardAlert, TeacherDashboardMorningDigest } from "../types/staff.types";

const docsTeacherExperienceHref = `${(process.env.NEXT_PUBLIC_DOCS_URL ?? "http://localhost:3002/docs").replace(/\/$/, "")}/teacher-experience`;

type Props = {
	todaySchedule: TeacherDaySchedule | null;
	classNameById: Map<string, string>;
	alerts: TeacherDashboardAlert[];
	digest: TeacherDashboardMorningDigest;
	onOpenPreferences?: () => void;
	className?: string;
};

export function TeacherFocusSidebar({
	todaySchedule,
	classNameById,
	alerts,
	digest,
	onOpenPreferences,
	className,
}: Props) {
	return (
		<aside className={cn("space-y-4", className)}>
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<div className="mb-3 flex items-center justify-between gap-2">
					<h3 className="font-medium text-[14px] text-foreground">Today&apos;s flow</h3>
					<Link href="/admin/timetable" className="text-[12px] text-primary hover:underline">
						Week
					</Link>
				</div>
				<TeacherTodaySchedule schedule={todaySchedule} classNameById={classNameById} compact />
			</div>

			{alerts.length > 0 ? (
				<div className="rounded-xl border border-amber-500/35 bg-amber-500/5 p-4">
					<div className="mb-2 flex items-center gap-2">
						<HugeiconsIcon
							icon={AlertCircleIcon}
							strokeWidth={2}
							className="size-4 text-amber-700"
						/>
						<h3 className="font-medium text-[13px] text-foreground">Watch list</h3>
					</div>
					<ul className="space-y-2 text-[12px]">
						{alerts.slice(0, 4).map((alert) => (
							<li key={`${alert.studentId}-${alert.sectionId}`}>
								<Link
									href={`/admin/my-classes/${alert.sectionId}`}
									className="text-foreground hover:text-primary"
								>
									{alert.studentName} · {alert.consecutiveDays} days absent
								</Link>
							</li>
						))}
					</ul>
				</div>
			) : null}

			<div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-[12px] text-muted-foreground">
				<p className="font-medium text-foreground text-[13px]">
					Coming next (your stunning roadmap)
				</p>
				<ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
					<li className="text-foreground">Class assessments + student insights — shipped</li>
					<li className="text-foreground">Teacher prefs sheet (device-local) — shipped</li>
					<li>Single 7 AM digest notification (Phase 2)</li>
					<li>Org-wide comms settings (Phase 2)</li>
					<li>Gate scan pre-fill (Phase 1 with hardware)</li>
				</ul>
				{onOpenPreferences ? (
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="mt-3 w-full"
						onClick={onOpenPreferences}
					>
						<HugeiconsIcon icon={Settings02Icon} data-icon="inline-start" strokeWidth={2} />
						Preferences
					</Button>
				) : null}
				<Link
					href={docsTeacherExperienceHref}
					className="mt-3 inline-flex items-center gap-1 text-primary hover:underline"
					target="_blank"
					rel="noreferrer"
				>
					<HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3.5" />
					Teacher experience docs
				</Link>
			</div>

			{digest.yesterdayUnmarkedSections.length > 0 ? (
				<div className="rounded-xl border border-border bg-card p-4 text-[12px]">
					<p className="font-medium text-[13px] text-foreground">Yesterday&apos;s attendance</p>
					<p className="mt-1 text-muted-foreground">Sessions not opened:</p>
					<ul className="mt-2 flex flex-wrap gap-2">
						{digest.yesterdayUnmarkedSections.map((section) => (
							<li key={section.sectionId}>
								<Link
									href={`/admin/attendance?sectionId=${section.sectionId}`}
									className="rounded-md bg-muted px-2 py-1 font-medium text-primary hover:bg-muted/80"
								>
									Section {section.sectionName}
								</Link>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</aside>
	);
}
