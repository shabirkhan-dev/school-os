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
	middleName?: string | null;
	fullName: string;
	dateOfBirth: string | null;
	gender: StudentGender | null;
	email: string | null;
	phone: string | null;
	addressLine1: string | null;
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
	status: StudentStatus;
	createdAt: string;
	updatedAt: string;
};

export type StudentGuardianLink = {
	id: string;
	studentId: string;
	guardianId: string;
	relationship: string;
	isPrimary: boolean;
	canPickup: boolean;
	receivesNotifications: boolean;
	guardian: {
		id: string;
		firstName: string;
		lastName: string;
		fullName: string;
		email: string | null;
		phone: string | null;
	};
};

export type StudentDetail = {
	student: Student;
	guardians: StudentGuardianLink[];
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
	middleName?: string;
	dateOfBirth?: string;
	gender?: StudentGender;
	status?: StudentStatus;
	email?: string;
	phone?: string;
	addressLine1?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	bloodGroup?: string;
	medicalNotes?: string;
	emergencyContactName?: string;
	emergencyContactPhone?: string;
	admittedOn?: string;
	previousSchool?: string;
	guardians?: Array<{
		firstName: string;
		lastName: string;
		email?: string;
		phone?: string;
		relationship:
			| "father"
			| "mother"
			| "guardian"
			| "step_parent"
			| "grandparent"
			| "sibling"
			| "other";
		isPrimary?: boolean;
	}>;
};

export type CreateEnrollmentInput = {
	sectionId: string;
	academicYearId: string;
	enrolledOn?: string;
};
