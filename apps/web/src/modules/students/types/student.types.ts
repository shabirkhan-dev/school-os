export type StudentStatus = "active" | "inactive" | "graduated" | "withdrawn";
export type StudentGender = "male" | "female" | "other" | "prefer_not_to_say";
export type EnrollmentStatus = "active" | "transferred" | "withdrawn";

export type Student = {
	id: string;
	tenantId: string;
	campusId: string;
	studentCode: string;
	firstName: string;
	lastName: string;
	fullName: string;
	dateOfBirth: string | null;
	gender: StudentGender | null;
	status: StudentStatus;
	createdAt: string;
	updatedAt: string;
};

export type Enrollment = {
	id: string;
	tenantId: string;
	studentId: string;
	sectionId: string;
	academicYearId: string;
	status: EnrollmentStatus;
	enrolledOn: string;
	createdAt: string;
	updatedAt: string;
};

export type CreateStudentInput = {
	campusId: string;
	studentCode: string;
	firstName: string;
	lastName: string;
	dateOfBirth?: string;
	gender?: StudentGender;
	status?: StudentStatus;
};

export type CreateEnrollmentInput = {
	sectionId: string;
	academicYearId: string;
	enrolledOn?: string;
};
