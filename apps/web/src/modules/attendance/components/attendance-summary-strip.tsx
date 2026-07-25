"use client";

import { Toggle } from "@school-os/ui/components/toggle";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import type { AttendanceStatusCounts } from "../types/attendance.types";
import type { AttendanceStatusFilter } from "../utils/attendance-ui.utils";
import { ATTENDANCE_STATUS_CONFIG, attendanceRate } from "../utils/attendance-ui.utils";

type Props = {
	summary: AttendanceStatusCounts;
	activeFilter: AttendanceStatusFilter;
	onFilterChange: (filter: AttendanceStatusFilter) => void;
};

const summaryCards: Array<{
	key: AttendanceStatusFilter;
	countKey: keyof AttendanceStatusCounts;
	status?: keyof typeof ATTENDANCE_STATUS_CONFIG;
	label: string;
}> = [
	{ key: "all", countKey: "total", label: "Total" },
	{ key: "present", countKey: "present", status: "present", label: "Present" },
	{ key: "late", countKey: "late", status: "late", label: "Late" },
	{ key: "absent", countKey: "absent", status: "absent", label: "Absent" },
	{ key: "excused", countKey: "excused", status: "excused", label: "Excused" },
	{ key: "needs_followup", countKey: "unknown", status: "unknown", label: "Unmarked" },
];

/** Segments of the distribution mini-bar, in rendering order. */
const distributionSegments: Array<{
	status: keyof typeof ATTENDANCE_STATUS_CONFIG;
	countKey: keyof AttendanceStatusCounts;
}> = [
	{ status: "present", countKey: "present" },
	{ status: "late", countKey: "late" },
	{ status: "excused", countKey: "excused" },
	{ status: "left_early", countKey: "leftEarly" },
	{ status: "absent", countKey: "absent" },
	{ status: "unknown", countKey: "unknown" },
];

export function AttendanceSummaryStrip({ summary, activeFilter, onFilterChange }: Props) {
	const reduce = useReducedMotion();
	const rate = attendanceRate(summary);

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="font-medium text-[13px] text-dashboard-text-primary">Live summary</p>
					<p className="text-[12px] text-dashboard-text-muted">
						{rate}% accounted · tap a stat to filter roster
					</p>
				</div>
				<div className="hidden min-w-[160px] sm:block">
					<div className="mb-1 flex justify-between text-[11px] text-dashboard-text-muted">
						<span>Attendance rate</span>
						<span className="font-medium tabular-nums text-dashboard-text-secondary">{rate}%</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-dashboard-surface-strong">
						<div
							className="h-full rounded-full bg-emerald-500 transition-[width] duration-300"
							style={{ width: `${rate}%` }}
						/>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
				{summaryCards.map((card) => {
					const count = summary[card.countKey] as number;
					const isActive = activeFilter === card.key;
					const config = card.status ? ATTENDANCE_STATUS_CONFIG[card.status] : null;

					return (
						<Toggle
							key={card.key}
							pressed={isActive}
							onPressedChange={() => onFilterChange(card.key)}
							className={cn(
								"h-auto flex-col items-start justify-start rounded-[12px] border px-3 py-2.5 text-start whitespace-normal",
								"transition-all duration-200",
								isActive
									? "border-dashboard-accent bg-dashboard-accent-soft ring-1 ring-dashboard-accent/30 aria-pressed:bg-dashboard-accent-soft"
									: "border-dashboard-border bg-dashboard-surface hover:bg-dashboard-surface-hover",
							)}
						>
							<p className="flex items-center gap-1.5 text-[10px] text-dashboard-text-muted uppercase tracking-wide">
								{config ? (
									<span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", config.dot)} />
								) : null}
								{card.label}
							</p>
							<p
								className={cn(
									"mt-0.5 font-semibold text-[18px] tabular-nums leading-6",
									config
										? config.tone.split(" ").slice(1).join(" ")
										: "text-dashboard-text-primary",
								)}
							>
								<AnimatePresence initial={false} mode="popLayout">
									<motion.span
										key={count}
										initial={reduce ? false : { opacity: 0, y: 6 }}
										animate={{ opacity: 1, y: 0 }}
										exit={reduce ? undefined : { opacity: 0, y: -6 }}
										transition={{ duration: 0.18, ease: EASE_OUT }}
										className="inline-block"
									>
										{count}
									</motion.span>
								</AnimatePresence>
							</p>
						</Toggle>
					);
				})}
			</div>

			{/* Distribution mini-bar: one segment per status, widths animate on change. */}
			<div
				role="img"
				aria-label={`Roster distribution: ${summary.present} present, ${summary.late} late, ${summary.absent} absent, ${summary.excused} excused, ${summary.leftEarly} left early, ${summary.unknown} unmarked`}
				className="flex h-1.5 gap-px overflow-hidden rounded-full bg-dashboard-surface-strong"
			>
				{distributionSegments.map((segment) => {
					const count = summary[segment.countKey] as number;
					if (count === 0) return null;
					return (
						<div
							key={segment.status}
							className={cn(
								"h-full transition-[flex-grow] duration-300 ease-out",
								ATTENDANCE_STATUS_CONFIG[segment.status].dot,
							)}
							style={{ flexGrow: count }}
						/>
					);
				})}
			</div>
		</div>
	);
}
