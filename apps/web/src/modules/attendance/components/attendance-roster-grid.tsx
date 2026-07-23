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
					<li key={student.id}>
						<button
							type="button"
							disabled={!canMark}
							onClick={() => {
								if (!canMark) return;
								onStatusChange(student.id, cycleAttendanceStatus(status));
							}}
							className={cn(
								"flex w-full items-center gap-3 rounded-[14px] border px-3 py-3 text-left transition-all",
								"border-dashboard-border bg-dashboard-surface hover:bg-dashboard-surface-hover",
								highlighted && "ring-2 ring-dashboard-accent",
								canMark && "active:scale-[0.99]",
								!canMark && "cursor-default opacity-80",
							)}
						>
							<span
								className={cn(
									"flex size-10 shrink-0 items-center justify-center rounded-xl font-semibold text-[12px] ring-1",
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
									"shrink-0 rounded-full px-2 py-0.5 font-medium text-[10px]",
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
