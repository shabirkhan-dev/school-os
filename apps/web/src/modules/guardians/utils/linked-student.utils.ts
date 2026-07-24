import type { Student } from "@/modules/students/types/student.types";
import type { LinkedStudent } from "../types/guardian.types";

export function linkedStudentToCardStudent(
	child: LinkedStudent,
	tenantId: string,
	campusId: string,
): Student {
	const now = new Date(0).toISOString();
	return {
		id: child.studentId,
		tenantId,
		campusId,
		studentCode: child.studentCode,
		firstName: child.firstName,
		lastName: child.lastName,
		fullName: child.fullName,
		dateOfBirth: null,
		gender: null,
		email: null,
		phone: null,
		addressLine1: null,
		city: null,
		state: null,
		postalCode: null,
		country: null,
		bloodGroup: null,
		medicalNotes: null,
		emergencyContactName: null,
		emergencyContactPhone: null,
		admittedOn: child.admittedOn,
		previousSchool: null,
		status: child.status,
		createdAt: now,
		updatedAt: now,
	};
}
