import type { AcademicYearRecord, ClassRecord, SectionRecord } from '@/database/schema';

export type PublicAcademicYear = {
	id: string;
	tenantId: string;
	name: string;
	startsOn: string;
	endsOn: string;
	status: AcademicYearRecord['status'];
	createdAt: string;
	updatedAt: string;
};

export type PublicClass = {
	id: string;
	tenantId: string;
	name: string;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
};

export type PublicSection = {
	id: string;
	tenantId: string;
	campusId: string;
	classId: string;
	academicYearId: string;
	name: string;
	homeroomTeacherMembershipId: string | null;
	status: SectionRecord['status'];
	createdAt: string;
	updatedAt: string;
};

export function toPublicAcademicYear(year: AcademicYearRecord): PublicAcademicYear {
	return {
		id: year.id,
		tenantId: year.tenantId,
		name: year.name,
		startsOn: year.startsOn,
		endsOn: year.endsOn,
		status: year.status,
		createdAt: year.createdAt.toISOString(),
		updatedAt: year.updatedAt.toISOString(),
	};
}

export function toPublicClass(classRecord: ClassRecord): PublicClass {
	return {
		id: classRecord.id,
		tenantId: classRecord.tenantId,
		name: classRecord.name,
		sortOrder: classRecord.sortOrder,
		createdAt: classRecord.createdAt.toISOString(),
		updatedAt: classRecord.updatedAt.toISOString(),
	};
}

export function toPublicSection(section: SectionRecord): PublicSection {
	return {
		id: section.id,
		tenantId: section.tenantId,
		campusId: section.campusId,
		classId: section.classId,
		academicYearId: section.academicYearId,
		name: section.name,
		homeroomTeacherMembershipId: section.homeroomTeacherMembershipId,
		status: section.status,
		createdAt: section.createdAt.toISOString(),
		updatedAt: section.updatedAt.toISOString(),
	};
}
