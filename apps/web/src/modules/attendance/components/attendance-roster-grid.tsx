"use client";

import { cn } from "@/lib/utils";
import type { AttendanceMarkStatus } from "../types/attendance.types";
import { ATTENDANCE_STATUS_CONFIG, cycleAttendanceStatus } from "../utils/attendance-ui.utils";

export type RosterStudent = {
	id: string;
	fullName: string;
	studentCode: string;
};

type Props = {
	roster: RosterStudent[];
	markDraft: Record<string, AttendanceMarkStatus>;
	highlightStudentId?: string | null;
	canMark: boolean;
	onStatusChange: (studentId: string, status: AttendanceMarkStatus) => void;
};

export function AttendanceRosterGrid({
	roster,
	markDraft,
	highlightStudentId,
	canMark,
	onStatusChange,
}: Props) {
	if (roster.length === 0) {
		return (
			<p className="py-8 text-center text-[13px] text-dashboard-text-muted">
				No students match your search or filter.
			</p>
		);
	}

	return (
		<ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
			{roster.map((student) => {
				const status = markDraft[student.id] ?? "unknown";
				const config = ATTENDANCE_STATUS_CONFIG[status];
				const highlighted = highlightStudentId === student.id;

				return (
					<li key={student.id} className="relative">
						{/* One-shot pulse ring when a scan marks this student. The key retriggers
							the keyframe on every scan; the kill-switch zeroes its duration. */}
						{highlighted ? (
							<span
								key={highlightStudentId}
								aria-hidden
								className="pointer-events-none absolute inset-0 animate-[attendance-scan-pulse_0.9s_ease-out_forwards] rounded-[14px] ring-2 ring-dashboard-accent"
							/>
						) : null}
						<button
							type="button"
							disabled={!canMark}
							onClick={() => {
								if (!canMark) return;
								onStatusChange(student.id, cycleAttendanceStatus(status));
							}}
							className={cn(
								"flex w-full items-center gap-3 rounded-[14px] border px-3 py-3 text-start",
								"border-dashboard-border bg-dashboard-surface transition-all duration-200",
								canMark &&
									"hover:-translate-y-px hover:border-dashboard-border-strong hover:shadow-sm active:scale-[0.99]",
								highlighted && "border-dashboard-accent/50",
								!canMark && "cursor-default opacity-80",
							)}
						>
							<span
								className={cn(
									"flex size-10 shrink-0 items-center justify-center rounded-xl font-semibold text-[12px] ring-1 transition-colors duration-300",
									config.tone,
									config.ring,
								)}
								aria-hidden
							>
								{config.short}
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate font-medium text-[13px] text-dashboard-text-primary">
									{student.fullName}
								</span>
								<span className="block truncate text-[11px] text-dashboard-text-muted">
									{student.studentCode}
								</span>
							</span>
							<span
								className={cn(
									"shrink-0 rounded-full px-2 py-0.5 font-medium text-[10px] transition-colors duration-300",
									config.tone,
								)}
							>
								{config.label}
							</span>
						</button>
					</li>
				);
			})}
		</ul>
	);
}
