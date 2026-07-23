import type { Student, StudentStatus } from "../types/student.types";

export function studentInitials(student: Pick<Student, "firstName" | "lastName">): string {
	const first = student.firstName.trim()[0] ?? "";
	const last = student.lastName.trim()[0] ?? "";
	return (first + last).toUpperCase() || "?";
}

export function formatStudentGender(gender: Student["gender"]): string {
	if (!gender) return "—";
	return gender.replaceAll("_", " ");
}

export function studentStatusBadgeVariant(
	status: StudentStatus,
): "default" | "secondary" | "outline" | "destructive" {
	switch (status) {
		case "active":
			return "default";
		case "inactive":
			return "secondary";
		case "graduated":
			return "outline";
		case "withdrawn":
			return "destructive";
		default:
			return "secondary";
	}
}

export function studentQrPayload(student: Student, tenantId: string): string {
	return `school-os://student/${tenantId}/${student.id}?code=${encodeURIComponent(student.studentCode)}`;
}
