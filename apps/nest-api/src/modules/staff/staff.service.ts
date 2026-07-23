import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import type { TenantContext } from '@/modules/tenants/tenant-context.types';
import type {
	AssignSectionSubjectInput,
	CreateSubjectInput,
	UpsertStaffProfileInput,
} from './staff.dto';
import { StaffRepository } from './staff.repository';
import {
	type PublicTeacher,
	toPublicStaffProfile,
	toPublicSubject,
	toPublicSubjectAssignment,
} from './staff.types';

@Injectable()
export class StaffService {
	constructor(
		private readonly staff: StaffRepository,
		private readonly membershipAccess: MembershipsService,
	) {}

	async listTeachers(userId: string, tenantId: string) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.STAFF_READ);
		const rows = await this.staff.listTeachers(tenantId);
		const teachers: PublicTeacher[] = await Promise.all(
			rows.map(async (row) => {
				const [homeroom, assignments] = await Promise.all([
					this.staff.listHomeroomSections(tenantId, row.membership.id),
					this.staff.listSubjectAssignments(tenantId, row.membership.id),
				]);
				return {
					membershipId: row.membership.id,
					userId: row.user.id,
					email: row.user.email,
					username: row.user.username,
					role: row.membership.role,
					campusId: row.membership.campusId,
					profile: toPublicStaffProfile(row.membership.id, row.profile),
					homeroomSectionCount: homeroom.length,
					subjectAssignmentCount: assignments.length,
				};
			}),
		);
		return { teachers };
	}

	async getTeacher(userId: string, tenantId: string, membershipId: string) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.STAFF_READ);
		return this.buildTeacherDetail(tenantId, membershipId);
	}

	async getMyTeacherProfile(tenant: TenantContext) {
		if (!tenant.roles.includes('teacher')) {
			throw new NotFoundException({
				code: 'TEACHER_PROFILE_NOT_FOUND',
				message: 'Teacher profile not available for this account',
			});
		}
		return this.buildTeacherDetail(tenant.tenantId, tenant.membershipId);
	}

	async upsertTeacherProfile(
		userId: string,
		tenantId: string,
		membershipId: string,
		input: UpsertStaffProfileInput,
	) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.STAFF_WRITE);
		const membership = await this.staff.findMembership(tenantId, membershipId);
		if (!membership || membership.role !== 'teacher') {
			throw new NotFoundException({
				code: 'TEACHER_NOT_FOUND',
				message: 'Teacher membership not found',
			});
		}

		const profile = await this.staff.upsertProfile({
			tenantId,
			membershipId,
			employeeCode: input.employeeCode?.trim().toUpperCase() ?? null,
			phone: input.phone?.trim() ?? null,
			qualification: input.qualification?.trim() ?? null,
			specialization: input.specialization?.trim() ?? null,
			hireDate: input.hireDate ?? null,
			status: input.status ?? 'active',
			notes: input.notes?.trim() ?? null,
		});
		return { profile: toPublicStaffProfile(membershipId, profile ?? null) };
	}

	async listSubjects(userId: string, tenantId: string) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.STAFF_READ);
		const rows = await this.staff.listSubjects(tenantId);
		return { subjects: rows.map(toPublicSubject) };
	}

	async createSubject(userId: string, tenantId: string, input: CreateSubjectInput) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.STAFF_WRITE);
		try {
			const subject = await this.staff.createSubject({
				tenantId,
				code: input.code.trim().toUpperCase(),
				name: input.name.trim(),
				description: input.description?.trim() ?? null,
			});
			return { subject: toPublicSubject(subject) };
		} catch {
			throw new ConflictException({
				code: 'SUBJECT_CODE_ALREADY_EXISTS',
				message: 'A subject with this code already exists',
			});
		}
	}

	async assignSectionSubject(userId: string, tenantId: string, input: AssignSectionSubjectInput) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.STAFF_WRITE);
		const teacher = await this.staff.findMembership(tenantId, input.teacherMembershipId);
		if (!teacher || teacher.role !== 'teacher') {
			throw new BadRequestException({
				code: 'INVALID_TEACHER',
				message: 'Subject teacher must be an active teacher membership',
			});
		}
		try {
			const assignment = await this.staff.assignSectionSubject({
				tenantId,
				sectionId: input.sectionId,
				subjectId: input.subjectId,
				teacherMembershipId: input.teacherMembershipId,
			});
			return { assignment };
		} catch {
			throw new ConflictException({
				code: 'SECTION_SUBJECT_ALREADY_EXISTS',
				message: 'This subject is already assigned to the section',
			});
		}
	}

	private async buildTeacherDetail(tenantId: string, membershipId: string) {
		const rows = await this.staff.listTeachers(tenantId);
		const row = rows.find((item) => item.membership.id === membershipId);
		if (!row) {
			throw new NotFoundException({
				code: 'TEACHER_NOT_FOUND',
				message: 'Teacher not found',
			});
		}
		const [homeroomSections, subjectAssignments] = await Promise.all([
			this.staff.listHomeroomSections(tenantId, membershipId),
			this.staff.listSubjectAssignments(tenantId, membershipId),
		]);
		return {
			teacher: {
				membershipId: row.membership.id,
				userId: row.user.id,
				email: row.user.email,
				username: row.user.username,
				role: row.membership.role,
				campusId: row.membership.campusId,
				profile: toPublicStaffProfile(membershipId, row.profile),
				homeroomSectionCount: homeroomSections.length,
				subjectAssignmentCount: subjectAssignments.length,
			},
			homeroomSections: homeroomSections.map((section) => ({
				id: section.id,
				name: section.name,
				campusId: section.campusId,
				classId: section.classId,
				academicYearId: section.academicYearId,
			})),
			subjectAssignments: subjectAssignments.map(toPublicSubjectAssignment),
		};
	}
}
