export type TeacherProfile = {
	id: string | null;
	membershipId: string;
	employeeCode: string | null;
	phone: string | null;
	qualification: string | null;
	specialization: string | null;
	hireDate: string | null;
	status: "active" | "inactive" | "on_leave";
	notes: string | null;
};

export type TeacherSummary = {
	membershipId: string;
	userId: string;
	email: string;
	username: string;
	role: string;
	campusId: string | null;
	profile: TeacherProfile;
	homeroomSectionCount: number;
	subjectAssignmentCount: number;
};

export type TeacherDetail = {
	teacher: Omit<TeacherSummary, "homeroomSectionCount" | "subjectAssignmentCount"> & {
		homeroomSectionCount: number;
		subjectAssignmentCount: number;
	};
	homeroomSections: Array<{
		id: string;
		name: string;
		campusId: string;
		classId: string;
		academicYearId: string;
	}>;
	subjectAssignments: Array<{
		id: string;
		sectionId: string;
		sectionName: string;
		subjectId: string;
		subjectCode: string;
		subjectName: string;
	}>;
};

export type UpsertStaffProfileInput = {
	employeeCode?: string;
	phone?: string;
	qualification?: string;
	specialization?: string;
	hireDate?: string;
	status?: "active" | "inactive" | "on_leave";
	notes?: string;
};

export type Subject = {
	id: string;
	code: string;
	name: string;
	description: string | null;
};

export type CreateSubjectInput = {
	code: string;
	name: string;
	description?: string;
};

export type AssignSectionSubjectInput = {
	sectionId: string;
	subjectId: string;
	teacherMembershipId: string;
};
