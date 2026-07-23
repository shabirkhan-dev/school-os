import type { TeacherProfile, TeacherSummary } from "../types/staff.types";

export function teacherDisplayName(teacher: Pick<TeacherSummary, "username" | "email">): string {
	if (teacher.username?.trim()) return teacher.username.trim();
	const local = teacher.email.split("@")[0];
	return local || teacher.email;
}

export function teacherInitials(teacher: Pick<TeacherSummary, "username" | "email">): string {
	const source = teacher.username?.trim() || teacher.email;
	const parts = source
		.replace(/[@._-]+/g, " ")
		.split(/\s+/)
		.filter(Boolean);
	if (parts.length >= 2) {
		return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
	}
	return source.slice(0, 2).toUpperCase() || "?";
}

export function teacherStatusBadgeVariant(
	status: TeacherProfile["status"],
): "default" | "secondary" | "outline" {
	switch (status) {
		case "active":
			return "default";
		case "inactive":
			return "secondary";
		case "on_leave":
			return "outline";
		default:
			return "secondary";
	}
}

export function formatTeacherStatus(status: TeacherProfile["status"]): string {
	return status.replaceAll("_", " ");
}

export function teacherQrPayload(teacher: TeacherSummary, tenantId: string): string {
	const code = teacher.profile.employeeCode ?? teacher.membershipId;
	return `school-os://teacher/${tenantId}/${teacher.membershipId}?code=${encodeURIComponent(code)}`;
}
