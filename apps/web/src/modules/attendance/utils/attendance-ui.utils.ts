import type { AttendanceMarkStatus, AttendanceStatusCounts } from "../types/attendance.types";

export type AttendanceStatusFilter = AttendanceMarkStatus | "all" | "unmarked" | "needs_followup";

export const ATTENDANCE_STATUS_ORDER: AttendanceMarkStatus[] = [
	"present",
	"late",
	"absent",
	"excused",
	"left_early",
	"unknown",
];

export const ATTENDANCE_STATUS_CONFIG: Record<
	AttendanceMarkStatus,
	{ label: string; short: string; tone: string; ring: string }
> = {
	present: {
		label: "Present",
		short: "P",
		tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
		ring: "ring-emerald-500/40",
	},
	late: {
		label: "Late",
		short: "L",
		tone: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
		ring: "ring-amber-500/40",
	},
	absent: {
		label: "Absent",
		short: "A",
		tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
		ring: "ring-rose-500/40",
	},
	excused: {
		label: "Excused",
		short: "E",
		tone: "bg-sky-500/15 text-sky-800 dark:text-sky-300",
		ring: "ring-sky-500/40",
	},
	left_early: {
		label: "Left early",
		short: "LE",
		tone: "bg-orange-500/15 text-orange-800 dark:text-orange-300",
		ring: "ring-orange-500/40",
	},
	unknown: {
		label: "Unmarked",
		short: "?",
		tone: "bg-dashboard-surface-strong text-dashboard-text-muted",
		ring: "ring-dashboard-border",
	},
};

export function cycleAttendanceStatus(current: AttendanceMarkStatus): AttendanceMarkStatus {
	const index = ATTENDANCE_STATUS_ORDER.indexOf(current);
	const next = index === -1 ? 0 : (index + 1) % ATTENDANCE_STATUS_ORDER.length;
	return ATTENDANCE_STATUS_ORDER[next] ?? "present";
}

export function computeDraftSummary(
	rosterStudentIds: string[],
	markDraft: Record<string, AttendanceMarkStatus>,
): AttendanceStatusCounts {
	const summary: AttendanceStatusCounts = {
		present: 0,
		absent: 0,
		late: 0,
		excused: 0,
		leftEarly: 0,
		unknown: 0,
		total: rosterStudentIds.length,
	};

	for (const studentId of rosterStudentIds) {
		const status = markDraft[studentId] ?? "unknown";
		if (status === "present") summary.present += 1;
		else if (status === "absent") summary.absent += 1;
		else if (status === "late") summary.late += 1;
		else if (status === "excused") summary.excused += 1;
		else if (status === "left_early") summary.leftEarly += 1;
		else summary.unknown += 1;
	}

	return summary;
}

export function buildSmartDefaultDraft(
	rosterStudentIds: string[],
	existingMarks: Record<string, AttendanceMarkStatus>,
): Record<string, AttendanceMarkStatus> {
	const draft: Record<string, AttendanceMarkStatus> = {};
	for (const studentId of rosterStudentIds) {
		draft[studentId] = existingMarks[studentId] ?? "present";
	}
	return draft;
}

export function filterRosterByStatus(
	studentIds: string[],
	markDraft: Record<string, AttendanceMarkStatus>,
	filter: AttendanceStatusFilter,
): string[] {
	if (filter === "all") return studentIds;
	if (filter === "unmarked") {
		return studentIds.filter((id) => (markDraft[id] ?? "unknown") === "unknown");
	}
	if (filter === "needs_followup") {
		return studentIds.filter((id) => (markDraft[id] ?? "unknown") === "unknown");
	}
	return studentIds.filter((id) => (markDraft[id] ?? "unknown") === filter);
}

export function attendanceRate(summary: AttendanceStatusCounts): number {
	if (summary.total === 0) return 0;
	const accounted = summary.present + summary.late + summary.excused;
	return Math.round((accounted / summary.total) * 100);
}
