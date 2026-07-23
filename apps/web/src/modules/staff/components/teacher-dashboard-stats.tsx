"use client";

import {
	AlertCircleIcon,
	Calendar03Icon,
	CheckmarkCircle02Icon,
	StudentIcon,
	TeacherIcon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import type { TeacherDashboard } from "../types/staff.types";

type Props = {
	stats: TeacherDashboard["stats"];
	className?: string;
};

export function TeacherDashboardStats({ stats, className }: Props) {
	const items = [
		{
			label: "Students",
			value: stats.totalStudents,
			icon: StudentIcon,
			hint: "Across your classes",
		},
		{
			label: "Classes",
			value: stats.totalClasses,
			icon: UserGroupIcon,
			hint: `${stats.homeroomCount} homeroom · ${stats.subjectCount} subject`,
		},
		{
			label: "Present today",
			value: stats.todayPresent,
			icon: CheckmarkCircle02Icon,
			hint:
				stats.todayAttendanceRate != null
					? `${stats.todayAttendanceRate}% attendance rate`
					: "Mark attendance to track",
		},
		{
			label: "Needs marking",
			value: stats.pendingAttendanceCount,
			icon: Calendar03Icon,
			hint: stats.pendingAttendanceCount === 0 ? "All caught up" : "Classes pending today",
			alert: stats.pendingAttendanceCount > 0,
		},
	];

	return (
		<div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
			{items.map((item) => (
				<div
					key={item.label}
					className={cn(
						"rounded-xl border bg-card p-4 shadow-sm",
						item.alert ? "border-amber-500/40 bg-amber-500/5" : "border-border",
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

export function TeacherDashboardInsights({
	stats,
	sessionDate,
	className,
}: {
	stats: TeacherDashboard["stats"];
	sessionDate: string;
	className?: string;
}) {
	if (stats.totalClasses === 0) return null;

	return (
		<div className={cn("grid gap-3 lg:grid-cols-3", className)}>
			<div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
				<p className="font-medium text-foreground text-sm">Today at a glance</p>
				<p className="mt-1 text-muted-foreground text-sm">
					{sessionDate}: {stats.todayPresent} present, {stats.todayAbsent} absent, {stats.todayLate}{" "}
					late across your classes.
				</p>
				{stats.pendingAttendanceCount > 0 ? (
					<p className="mt-3 flex items-center gap-2 text-amber-700 text-sm dark:text-amber-300">
						<HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 shrink-0" />
						{stats.pendingAttendanceCount} class{stats.pendingAttendanceCount === 1 ? "" : "es"}{" "}
						still need attendance marked.
					</p>
				) : (
					<p className="mt-3 flex items-center gap-2 text-emerald-700 text-sm dark:text-emerald-300">
						<HugeiconsIcon
							icon={CheckmarkCircle02Icon}
							strokeWidth={2}
							className="size-4 shrink-0"
						/>
						All class attendance is complete for today.
					</p>
				)}
			</div>
			<div className="rounded-xl border border-border bg-card p-4">
				<p className="font-medium text-foreground text-sm">Teaching load</p>
				<div className="mt-3 space-y-2 text-sm">
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Homeroom sections</span>
						<span className="font-medium tabular-nums">{stats.homeroomCount}</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Subject classes</span>
						<span className="font-medium tabular-nums">{stats.subjectCount}</span>
					</div>
					<div className="flex items-center justify-between gap-3">
						<span className="text-muted-foreground">Students taught</span>
						<span className="font-medium tabular-nums">{stats.totalStudents}</span>
					</div>
				</div>
				<p className="mt-4 flex items-center gap-1.5 text-[12px] text-muted-foreground">
					<HugeiconsIcon icon={TeacherIcon} strokeWidth={2} className="size-3.5" />
					Smart actions update as you mark attendance.
				</p>
			</div>
		</div>
	);
}
