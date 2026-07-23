import type { SectionRecord, StaffProfileRecord, SubjectRecord } from '@/database/schema';

export type PublicStaffProfile = {
	id: string | null;
	membershipId: string;
	employeeCode: string | null;
	phone: string | null;
	qualification: string | null;
	specialization: string | null;
	hireDate: string | null;
	status: StaffProfileRecord['status'] | 'active';
	notes: string | null;
};

export type PublicTeacher = {
	membershipId: string;
	userId: string;
	email: string;
	username: string;
	role: string;
	campusId: string | null;
	profile: PublicStaffProfile;
	homeroomSectionCount: number;
	subjectAssignmentCount: number;
};

export type PublicSubjectAssignment = {
	id: string;
	sectionId: string;
	sectionName: string;
	subjectId: string;
	subjectCode: string;
	subjectName: string;
};

export type PublicSubject = {
	id: string;
	code: string;
	name: string;
	description: string | null;
};

export function toPublicStaffProfile(
	membershipId: string,
	profile: StaffProfileRecord | null,
): PublicStaffProfile {
	if (!profile) {
		return {
			id: null,
			membershipId,
			employeeCode: null,
			phone: null,
			qualification: null,
			specialization: null,
			hireDate: null,
			status: 'active',
			notes: null,
		};
	}
	return {
		id: profile.id,
		membershipId: profile.membershipId,
		employeeCode: profile.employeeCode,
		phone: profile.phone,
		qualification: profile.qualification,
		specialization: profile.specialization,
		hireDate: profile.hireDate,
		status: profile.status,
		notes: profile.notes,
	};
}

export function toPublicSubject(subject: SubjectRecord): PublicSubject {
	return {
		id: subject.id,
		code: subject.code,
		name: subject.name,
		description: subject.description,
	};
}

export function toPublicSubjectAssignment(input: {
	assignment: { id: string; sectionId: string; subjectId: string };
	section: SectionRecord;
	subject: SubjectRecord;
}): PublicSubjectAssignment {
	return {
		id: input.assignment.id,
		sectionId: input.section.id,
		sectionName: input.section.name,
		subjectId: input.subject.id,
		subjectCode: input.subject.code,
		subjectName: input.subject.name,
	};
}
