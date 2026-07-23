import type { EnrollmentRecord, StudentRecord } from '@/database/schema';

export type PublicStudent = {
	id: string;
	tenantId: string;
	campusId: string;
	studentCode: string;
	firstName: string;
	lastName: string;
	fullName: string;
	dateOfBirth: string | null;
	gender: StudentRecord['gender'];
	status: StudentRecord['status'];
	createdAt: string;
	updatedAt: string;
};

export type PublicEnrollment = {
	id: string;
	tenantId: string;
	studentId: string;
	sectionId: string;
	academicYearId: string;
	status: EnrollmentRecord['status'];
	enrolledOn: string;
	createdAt: string;
	updatedAt: string;
};

export function toPublicStudent(student: StudentRecord): PublicStudent {
	return {
		id: student.id,
		tenantId: student.tenantId,
		campusId: student.campusId,
		studentCode: student.studentCode,
		firstName: student.firstName,
		lastName: student.lastName,
		fullName: `${student.firstName} ${student.lastName}`.trim(),
		dateOfBirth: student.dateOfBirth,
		gender: student.gender,
		status: student.status,
		createdAt: student.createdAt.toISOString(),
		updatedAt: student.updatedAt.toISOString(),
	};
}

export function toPublicEnrollment(enrollment: EnrollmentRecord): PublicEnrollment {
	return {
		id: enrollment.id,
		tenantId: enrollment.tenantId,
		studentId: enrollment.studentId,
		sectionId: enrollment.sectionId,
		academicYearId: enrollment.academicYearId,
		status: enrollment.status,
		enrolledOn: enrollment.enrolledOn,
		createdAt: enrollment.createdAt.toISOString(),
		updatedAt: enrollment.updatedAt.toISOString(),
	};
}
