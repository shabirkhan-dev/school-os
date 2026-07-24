import type { EnrollmentRecord, StudentRecord } from '@/database/schema';

import type { PublicStudentGuardianLink } from '@/modules/guardians/guardians.types';

export type PublicStudent = {
	id: string;
	tenantId: string;
	campusId: string;
	studentCode: string;
	firstName: string;
	lastName: string;
	middleName: string | null;
	fullName: string;
	dateOfBirth: string | null;
	gender: StudentRecord['gender'];
	email: string | null;
	phone: string | null;
	addressLine1: string | null;
	addressLine2: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	country: string | null;
	bloodGroup: string | null;
	medicalNotes: string | null;
	emergencyContactName: string | null;
	emergencyContactPhone: string | null;
	admittedOn: string | null;
	previousSchool: string | null;
	photoUrl: string | null;
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

export type PublicStudentDetail = {
	student: PublicStudent;
	guardians: PublicStudentGuardianLink[];
};

export function toPublicStudent(student: StudentRecord): PublicStudent {
	const fullName = [student.firstName, student.middleName, student.lastName]
		.filter(Boolean)
		.join(' ')
		.trim();
	return {
		id: student.id,
		tenantId: student.tenantId,
		campusId: student.campusId,
		studentCode: student.studentCode,
		firstName: student.firstName,
		lastName: student.lastName,
		middleName: student.middleName,
		fullName,
		dateOfBirth: student.dateOfBirth,
		gender: student.gender,
		email: student.email,
		phone: student.phone,
		addressLine1: student.addressLine1,
		addressLine2: student.addressLine2,
		city: student.city,
		state: student.state,
		postalCode: student.postalCode,
		country: student.country,
		bloodGroup: student.bloodGroup,
		medicalNotes: student.medicalNotes,
		emergencyContactName: student.emergencyContactName,
		emergencyContactPhone: student.emergencyContactPhone,
		admittedOn: student.admittedOn,
		previousSchool: student.previousSchool,
		photoUrl: student.photoUrl,
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
