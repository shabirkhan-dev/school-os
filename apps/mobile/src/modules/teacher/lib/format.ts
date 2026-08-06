import type { StatusVariant } from "@/components/ui/status-badge";
import { AppColors } from "@/constants/design-system";
import type { AssessmentStatus, AssessmentType } from "../types/assessment.types";
import type { AttendanceMarkStatus } from "../types/attendance.types";
import type { HomeworkStatus } from "../types/homework.types";
import type { HomeworkSubmissionStatus } from "../types/homework-submissions.types";

export function formatDate(value: string | null | undefined): string {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatFullDate(value: string | null | undefined): string {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function formatTime(value: string | null | undefined): string {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(value: string | null | undefined): string {
	if (!value) return "—";
	return `${formatDate(value)} · ${formatTime(value)}`;
}

export function formatMinutes(minutes: number | null | undefined): string {
	if (minutes == null || minutes <= 0) return "—";
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;
	return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function localSessionDate(): string {
	return new Date().toLocaleDateString("en-CA");
}

export const homeworkStatusVariant: Record<HomeworkStatus, StatusVariant> = {
	draft: "pending",
	published: "brand",
	closed: "present",
};

export const assessmentStatusVariant: Record<AssessmentStatus, StatusVariant> = {
	draft: "pending",
	published: "brand",
	closed: "present",
};

export const submissionStatusVariant: Record<HomeworkSubmissionStatus, StatusVariant> = {
	pending: "pending",
	submitted: "brand",
	late: "late",
	graded: "present",
	excused: "excused",
};

export function attendanceStatusLabel(status: AttendanceMarkStatus): string {
	return status.replace("_", " ");
}

export function attendanceStatusVariant(status: AttendanceMarkStatus): StatusVariant {
	switch (status) {
		case "present":
			return "present";
		case "absent":
			return "absent";
		case "late":
			return "late";
		case "excused":
			return "excused";
		default:
			return "pending";
	}
}

export function attendanceStatusColor(status: AttendanceMarkStatus): string {
	switch (status) {
		case "present":
			return AppColors.status.present;
		case "absent":
			return AppColors.status.absent;
		case "late":
			return AppColors.status.late;
		case "excused":
			return AppColors.status.excused;
		default:
			return AppColors.status.pending;
	}
}

export function attendanceStatusBackground(status: AttendanceMarkStatus): string {
	switch (status) {
		case "present":
			return AppColors.status.presentBg;
		case "absent":
			return AppColors.status.absentBg;
		case "late":
			return AppColors.status.lateBg;
		case "excused":
			return AppColors.status.excusedBg;
		default:
			return AppColors.status.pendingBg;
	}
}

export const assessmentTypeLabel: Record<AssessmentType, string> = {
	quiz: "Quiz",
	test: "Test",
	exam: "Exam",
};
