"use client";

import {
	AlertCircleIcon,
	Calendar03Icon,
	CheckmarkCircle02Icon,
	Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import type { TeacherDashboard } from "../types/staff.types";

type Props = {
	stats: TeacherDashboard["stats"];
	className?: string;
};

export function TeacherTodayOverview({ stats, className }: Props) {
	const items = [
		{
			label: "Classes today",
			value: stats.todayPeriodCount > 0 ? stats.todayPeriodCount : stats.totalClasses,
			hint:
				stats.todayPeriodCount > 0
					? `${stats.todayPeriodCount} on timetable · ${stats.totalClasses} assigned`
					: `${stats.homeroomCount} homeroom · ${stats.subjectCount} subject`,
			icon: Calendar03Icon,
		},
		{
			label: "Attendance",
			value: stats.todayAttendanceRate != null ? `${stats.todayAttendanceRate}%` : "—",
			hint: `${stats.todayPresent} present · ${stats.todayAbsent} absent · ${stats.todayLate} late`,
			icon: CheckmarkCircle02Icon,
			positive: stats.todayAttendanceRate != null && stats.todayAttendanceRate >= 85,
		},
		{
			label: "Pending tasks",
			value: stats.pendingTaskCount,
			hint:
				stats.pendingTaskCount === 0
					? "All caught up"
					: `${stats.pendingAttendanceCount} need attendance marking`,
			icon: Task01Icon,
			alert: stats.pendingTaskCount > 0,
		},
		{
			label: "Alerts",
			value: stats.alertCount,
			hint:
				stats.alertCount === 0
					? "No students flagged"
					: `${stats.alertCount} student${stats.alertCount === 1 ? "" : "s"} absent 3+ days`,
			icon: AlertCircleIcon,
			alert: stats.alertCount > 0,
		},
	];

	return (
		<div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
			{items.map((item) => (
				<div
					key={item.label}
					className={cn(
						"rounded-xl border bg-card p-4 shadow-sm",
						item.alert
							? "border-amber-500/40 bg-amber-500/5"
							: item.positive
								? "border-emerald-500/30 bg-emerald-500/5"
								: "border-border",
					)}
				>
					<div className="flex items-start justify-between gap-2">
						<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
							{item.label}
						</p>
						<HugeiconsIcon
							icon={item.icon}
							strokeWidth={2}
							className="size-4 text-muted-foreground"
						/>
					</div>
					<p className="mt-1 font-semibold text-[28px] text-foreground tabular-nums">
						{item.value}
					</p>
					<p className="mt-1 text-[12px] text-muted-foreground">{item.hint}</p>
				</div>
			))}
		</div>
	);
}
