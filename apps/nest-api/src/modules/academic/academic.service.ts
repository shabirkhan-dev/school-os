import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { CampusesRepository } from '@/modules/campuses/campuses.repository';
import { MembershipsRepository } from '@/modules/memberships/memberships.repository';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import type {
	AssignSectionTeacherInput,
	CreateAcademicYearInput,
	CreateClassInput,
	CreateSectionInput,
	UpdateAcademicYearInput,
	UpdateClassInput,
	UpdateSectionInput,
} from './academic.dto';
import { AcademicRepository } from './academic.repository';
import { toPublicAcademicYear, toPublicClass, toPublicSection } from './academic.types';

@Injectable()
export class AcademicService {
	constructor(
		private readonly academic: AcademicRepository,
		private readonly campuses: CampusesRepository,
		private readonly memberships: MembershipsRepository,
		private readonly membershipAccess: MembershipsService,
	) {}

	async listAcademicYears(userId: string, tenantId: string) {
		await this.requireRead(userId, tenantId);
		const rows = await this.academic.listAcademicYears(tenantId);
		return { academicYears: rows.map(toPublicAcademicYear) };
	}

	async createAcademicYear(userId: string, tenantId: string, input: CreateAcademicYearInput) {
		await this.requireWrite(userId, tenantId);
		const status = input.status ?? 'draft';

		if (status === 'active') {
			const existingActive = await this.academic.findActiveAcademicYear(tenantId);
			if (existingActive) {
				throw new ConflictException({
					code: 'ACADEMIC_YEAR_ACTIVE_EXISTS',
					message: 'Only one active academic year is allowed per organization',
				});
			}
		}

		const year = await this.academic.createAcademicYear({
			tenantId,
			name: input.name.trim(),
			startsOn: input.startsOn,
			endsOn: input.endsOn,
			status,
		});
		return { academicYear: toPublicAcademicYear(year) };
	}

	async updateAcademicYear(
		userId: string,
		tenantId: string,
		academicYearId: string,
		input: UpdateAcademicYearInput,
	) {
		await this.requireWrite(userId, tenantId);
		await this.requireAcademicYear(tenantId, academicYearId);

		if (input.status === 'active') {
			const existingActive = await this.academic.findActiveAcademicYear(tenantId, academicYearId);
			if (existingActive) {
				throw new ConflictException({
					code: 'ACADEMIC_YEAR_ACTIVE_EXISTS',
					message: 'Only one active academic year is allowed per organization',
				});
			}
		}

		const year = await this.academic.updateAcademicYear(tenantId, academicYearId, {
			name: input.name?.trim(),
			startsOn: input.startsOn,
			endsOn: input.endsOn,
			status: input.status,
		});
		if (!year) {
			throw new NotFoundException({
				code: 'ACADEMIC_YEAR_NOT_FOUND',
				message: 'Academic year not found',
			});
		}
		return { academicYear: toPublicAcademicYear(year) };
	}

	async listClasses(userId: string, tenantId: string) {
		await this.requireRead(userId, tenantId);
		const rows = await this.academic.listClasses(tenantId);
		return { classes: rows.map(toPublicClass) };
	}

	async createClass(userId: string, tenantId: string, input: CreateClassInput) {
		await this.requireWrite(userId, tenantId);
		const name = input.name.trim();
		if (await this.academic.findClassByName(tenantId, name)) {
			throw new ConflictException({
				code: 'CLASS_NAME_ALREADY_EXISTS',
				message: 'A class with this name already exists',
			});
		}

		const classRecord = await this.academic.createClass({
			tenantId,
			name,
			sortOrder: input.sortOrder ?? 0,
		});
		return { class: toPublicClass(classRecord) };
	}

	async updateClass(userId: string, tenantId: string, classId: string, input: UpdateClassInput) {
		await this.requireWrite(userId, tenantId);
		await this.requireClass(tenantId, classId);

		if (input.name) {
			const existing = await this.academic.findClassByName(tenantId, input.name.trim());
			if (existing && existing.id !== classId) {
				throw new ConflictException({
					code: 'CLASS_NAME_ALREADY_EXISTS',
					message: 'A class with this name already exists',
				});
			}
		}

		const classRecord = await this.academic.updateClass(tenantId, classId, {
			name: input.name?.trim(),
			sortOrder: input.sortOrder,
		});
		if (!classRecord) {
			throw new NotFoundException({
				code: 'CLASS_NOT_FOUND',
				message: 'Class not found',
			});
		}
		return { class: toPublicClass(classRecord) };
	}

	async listSections(
		userId: string,
		tenantId: string,
		filters?: { campusId?: string; academicYearId?: string },
	) {
		await this.requireRead(userId, tenantId);
		const rows = await this.academic.listSections(tenantId, filters);
		return { sections: rows.map(toPublicSection) };
	}

	async createSection(userId: string, tenantId: string, input: CreateSectionInput) {
		await this.requireWrite(userId, tenantId);
		await this.requireCampus(tenantId, input.campusId);
		await this.requireClass(tenantId, input.classId);
		await this.requireAcademicYear(tenantId, input.academicYearId);

		if (input.homeroomTeacherMembershipId) {
			await this.requireTeacherMembership(tenantId, input.homeroomTeacherMembershipId);
		}

		const section = await this.academic.createSection({
			tenantId,
			campusId: input.campusId,
			classId: input.classId,
			academicYearId: input.academicYearId,
			name: input.name.trim(),
			homeroomTeacherMembershipId: input.homeroomTeacherMembershipId ?? null,
		});
		return { section: toPublicSection(section) };
	}

	async updateSection(
		userId: string,
		tenantId: string,
		sectionId: string,
		input: UpdateSectionInput,
	) {
		await this.requireWrite(userId, tenantId);
		await this.requireSection(tenantId, sectionId);

		if (input.homeroomTeacherMembershipId) {
			await this.requireTeacherMembership(tenantId, input.homeroomTeacherMembershipId);
		}

		const section = await this.academic.updateSection(tenantId, sectionId, {
			name: input.name?.trim(),
			status: input.status,
			homeroomTeacherMembershipId:
				input.homeroomTeacherMembershipId === undefined
					? undefined
					: input.homeroomTeacherMembershipId,
		});
		if (!section) {
			throw new NotFoundException({
				code: 'SECTION_NOT_FOUND',
				message: 'Section not found',
			});
		}
		return { section: toPublicSection(section) };
	}

	async assignSectionTeacher(
		userId: string,
		tenantId: string,
		sectionId: string,
		input: AssignSectionTeacherInput,
	) {
		await this.requireWrite(userId, tenantId);
		await this.requireSection(tenantId, sectionId);
		await this.requireTeacherMembership(tenantId, input.membershipId);

		const section = await this.academic.updateSection(tenantId, sectionId, {
			homeroomTeacherMembershipId: input.membershipId,
		});
		if (!section) {
			throw new NotFoundException({
				code: 'SECTION_NOT_FOUND',
				message: 'Section not found',
			});
		}
		return { section: toPublicSection(section) };
	}

	private async requireRead(userId: string, tenantId: string) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.ACADEMIC_READ);
	}

	private async requireWrite(userId: string, tenantId: string) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.ACADEMIC_WRITE);
	}

	private async requireAcademicYear(tenantId: string, academicYearId: string) {
		const year = await this.academic.findAcademicYearById(tenantId, academicYearId);
		if (!year) {
			throw new NotFoundException({
				code: 'ACADEMIC_YEAR_NOT_FOUND',
				message: 'Academic year not found',
			});
		}
		return year;
	}

	private async requireClass(tenantId: string, classId: string) {
		const classRecord = await this.academic.findClassById(tenantId, classId);
		if (!classRecord) {
			throw new NotFoundException({
				code: 'CLASS_NOT_FOUND',
				message: 'Class not found',
			});
		}
		return classRecord;
	}

	private async requireSection(tenantId: string, sectionId: string) {
		const section = await this.academic.findSectionById(tenantId, sectionId);
		if (!section) {
			throw new NotFoundException({
				code: 'SECTION_NOT_FOUND',
				message: 'Section not found',
			});
		}
		return section;
	}

	private async requireCampus(tenantId: string, campusId: string) {
		const campus = await this.campuses.findByIdForTenant(tenantId, campusId);
		if (!campus) {
			throw new NotFoundException({
				code: 'CAMPUS_NOT_FOUND',
				message: 'Campus not found',
			});
		}
		return campus;
	}

	private async requireTeacherMembership(tenantId: string, membershipId: string) {
		const membership = await this.memberships.findActiveById(membershipId);
		if (!membership || membership.tenantId !== tenantId || membership.status !== 'active') {
			throw new NotFoundException({
				code: 'MEMBERSHIP_NOT_FOUND',
				message: 'Teacher membership not found',
			});
		}
		if (!['teacher', 'principal', 'admin', 'owner'].includes(membership.role)) {
			throw new BadRequestException({
				code: 'INVALID_TEACHER_MEMBERSHIP',
				message: 'Selected membership cannot be assigned as a section teacher',
			});
		}
		return membership;
	}
}
