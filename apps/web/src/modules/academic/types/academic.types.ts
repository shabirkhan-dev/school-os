export type AcademicYearStatus = "draft" | "active" | "archived";
export type SectionStatus = "active" | "inactive";

export type AcademicYear = {
	id: string;
	tenantId: string;
	name: string;
	startsOn: string;
	endsOn: string;
	status: AcademicYearStatus;
	createdAt: string;
	updatedAt: string;
};

export type SchoolClass = {
	id: string;
	tenantId: string;
	name: string;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
};

export type Section = {
	id: string;
	tenantId: string;
	campusId: string;
	classId: string;
	academicYearId: string;
	name: string;
	homeroomTeacherMembershipId: string | null;
	status: SectionStatus;
	createdAt: string;
	updatedAt: string;
};

export type CreateAcademicYearInput = {
	name: string;
	startsOn: string;
	endsOn: string;
	status?: AcademicYearStatus;
};

export type CreateClassInput = {
	name: string;
	sortOrder?: number;
};

export type CreateSectionInput = {
	campusId: string;
	classId: string;
	academicYearId: string;
	name: string;
};

export type UpdateAcademicYearInput = {
	name?: string;
	startsOn?: string;
	endsOn?: string;
	status?: AcademicYearStatus;
};

export type UpdateClassInput = {
	name?: string;
	sortOrder?: number;
};

export type UpdateSectionInput = {
	name?: string;
	status?: SectionStatus;
	homeroomTeacherMembershipId?: string | null;
};
