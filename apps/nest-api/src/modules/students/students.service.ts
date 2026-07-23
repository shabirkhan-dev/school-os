import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import type { StudentRecord } from '@/database/schema';
import { AcademicRepository } from '@/modules/academic/academic.repository';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { CampusesRepository } from '@/modules/campuses/campuses.repository';
import { GuardiansRepository } from '@/modules/guardians/guardians.repository';
import { toPublicStudentGuardianLink } from '@/modules/guardians/guardians.types';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import type {
	CreateEnrollmentInput,
	CreateStudentInput,
	UpdateEnrollmentInput,
	UpdateStudentInput,
} from './students.dto';
import { StudentsRepository } from './students.repository';
import { toPublicEnrollment, toPublicStudent } from './students.types';

@Injectable()
export class StudentsService {
	constructor(
		private readonly students: StudentsRepository,
		private readonly campuses: CampusesRepository,
		private readonly academic: AcademicRepository,
		private readonly guardians: GuardiansRepository,
		private readonly membershipAccess: MembershipsService,
	) {}

	async listStudents(
		userId: string,
		tenantId: string,
		filters?: { campusId?: string; status?: StudentRecord['status'] },
	) {
		await this.requireRead(userId, tenantId);
		if (filters?.campusId) {
			await this.requireCampus(tenantId, filters.campusId);
		}
		const rows = await this.students.listStudents(tenantId, filters);
		return { students: rows.map(toPublicStudent) };
	}

	async getStudent(userId: string, tenantId: string, studentId: string) {
		await this.requireRead(userId, tenantId);
		const student = await this.requireStudent(tenantId, studentId);
		const guardianRows = await this.guardians.listStudentGuardians(tenantId, studentId);
		return {
			student: toPublicStudent(student),
			guardians: guardianRows.map(toPublicStudentGuardianLink),
		};
	}

	async createStudent(userId: string, tenantId: string, input: CreateStudentInput) {
		await this.requireWrite(userId, tenantId);
		await this.requireCampus(tenantId, input.campusId);

		const studentCode = input.studentCode.trim().toUpperCase();
		if (await this.students.findStudentByCode(tenantId, studentCode)) {
			throw new ConflictException({
				code: 'STUDENT_CODE_ALREADY_EXISTS',
				message: 'A student with this admission number already exists',
			});
		}

		const student = await this.students.createStudent({
			tenantId,
			campusId: input.campusId,
			studentCode,
			firstName: input.firstName.trim(),
			lastName: input.lastName.trim(),
			middleName: input.middleName?.trim() ?? null,
			dateOfBirth: input.dateOfBirth ?? null,
			gender: input.gender ?? null,
			email: input.email?.trim() ?? null,
			phone: input.phone?.trim() ?? null,
			addressLine1: input.addressLine1?.trim() ?? null,
			addressLine2: input.addressLine2?.trim() ?? null,
			city: input.city?.trim() ?? null,
			state: input.state?.trim() ?? null,
			postalCode: input.postalCode?.trim() ?? null,
			country: input.country?.trim() ?? null,
			bloodGroup: input.bloodGroup?.trim() ?? null,
			medicalNotes: input.medicalNotes?.trim() ?? null,
			emergencyContactName: input.emergencyContactName?.trim() ?? null,
			emergencyContactPhone: input.emergencyContactPhone?.trim() ?? null,
			admittedOn: input.admittedOn ?? new Date().toISOString().slice(0, 10),
			previousSchool: input.previousSchool?.trim() ?? null,
			status: input.status ?? 'active',
		});

		if (input.guardians?.length) {
			for (const guardianInput of input.guardians) {
				const guardian = await this.guardians.createGuardian({
					tenantId,
					membershipId: null,
					firstName: guardianInput.firstName.trim(),
					lastName: guardianInput.lastName.trim(),
					email: guardianInput.email?.trim() ?? null,
					phone: guardianInput.phone?.trim() ?? null,
					alternatePhone: guardianInput.alternatePhone?.trim() ?? null,
					addressLine1: null,
					addressLine2: null,
					city: null,
					state: null,
					postalCode: null,
					country: null,
					occupation: guardianInput.occupation?.trim() ?? null,
					preferredChannel: guardianInput.preferredChannel ?? 'phone',
				});
				await this.guardians.linkStudentGuardian({
					tenantId,
					studentId: student.id,
					guardianId: guardian.id,
					relationship: guardianInput.relationship,
					isPrimary: guardianInput.isPrimary ?? false,
					canPickup: guardianInput.canPickup ?? true,
					receivesNotifications: guardianInput.receivesNotifications ?? true,
				});
			}
		}

		return { student: toPublicStudent(student) };
	}

	async updateStudent(
		userId: string,
		tenantId: string,
		studentId: string,
		input: UpdateStudentInput,
	) {
		await this.requireWrite(userId, tenantId);
		await this.requireStudent(tenantId, studentId);

		const student = await this.students.updateStudent(tenantId, studentId, {
			firstName: input.firstName?.trim(),
			lastName: input.lastName?.trim(),
			middleName: input.middleName === undefined ? undefined : (input.middleName?.trim() ?? null),
			dateOfBirth: input.dateOfBirth === undefined ? undefined : input.dateOfBirth,
			gender: input.gender === undefined ? undefined : input.gender,
			status: input.status,
			email: input.email === undefined ? undefined : (input.email?.trim() ?? null),
			phone: input.phone === undefined ? undefined : (input.phone?.trim() ?? null),
			addressLine1:
				input.addressLine1 === undefined ? undefined : (input.addressLine1?.trim() ?? null),
			addressLine2:
				input.addressLine2 === undefined ? undefined : (input.addressLine2?.trim() ?? null),
			city: input.city === undefined ? undefined : (input.city?.trim() ?? null),
			state: input.state === undefined ? undefined : (input.state?.trim() ?? null),
			postalCode: input.postalCode === undefined ? undefined : (input.postalCode?.trim() ?? null),
			country: input.country === undefined ? undefined : (input.country?.trim() ?? null),
			bloodGroup: input.bloodGroup === undefined ? undefined : (input.bloodGroup?.trim() ?? null),
			medicalNotes:
				input.medicalNotes === undefined ? undefined : (input.medicalNotes?.trim() ?? null),
			emergencyContactName:
				input.emergencyContactName === undefined
					? undefined
					: (input.emergencyContactName?.trim() ?? null),
			emergencyContactPhone:
				input.emergencyContactPhone === undefined
					? undefined
					: (input.emergencyContactPhone?.trim() ?? null),
			admittedOn: input.admittedOn === undefined ? undefined : input.admittedOn,
			previousSchool:
				input.previousSchool === undefined ? undefined : (input.previousSchool?.trim() ?? null),
		});
		if (!student) {
			throw new NotFoundException({
				code: 'STUDENT_NOT_FOUND',
				message: 'Student not found',
			});
		}
		return { student: toPublicStudent(student) };
	}

	async listEnrollments(
		userId: string,
		tenantId: string,
		filters?: { studentId?: string; sectionId?: string; academicYearId?: string },
	) {
		await this.requireRead(userId, tenantId);
		if (filters?.studentId) {
			await this.requireStudent(tenantId, filters.studentId);
		}
		if (filters?.sectionId) {
			await this.requireSection(tenantId, filters.sectionId);
		}
		if (filters?.academicYearId) {
			await this.requireAcademicYear(tenantId, filters.academicYearId);
		}

		const rows = await this.students.listEnrollments(tenantId, filters);
		return { enrollments: rows.map(toPublicEnrollment) };
	}

	async createEnrollment(
		userId: string,
		tenantId: string,
		studentId: string,
		input: CreateEnrollmentInput,
	) {
		await this.requireWrite(userId, tenantId);
		const student = await this.requireStudent(tenantId, studentId);
		const section = await this.requireSection(tenantId, input.sectionId);
		await this.requireAcademicYear(tenantId, input.academicYearId);

		if (section.academicYearId !== input.academicYearId) {
			throw new BadRequestException({
				code: 'ENROLLMENT_YEAR_MISMATCH',
				message: 'Section does not belong to the selected academic year',
			});
		}
		if (section.campusId !== student.campusId) {
			throw new BadRequestException({
				code: 'ENROLLMENT_CAMPUS_MISMATCH',
				message: 'Student campus must match the section campus',
			});
		}

		const existing = await this.students.findActiveEnrollmentForYear(
			tenantId,
			studentId,
			input.academicYearId,
		);
		if (existing) {
			throw new ConflictException({
				code: 'ACTIVE_ENROLLMENT_EXISTS',
				message: 'Student already has an active enrollment for this academic year',
			});
		}

		const enrollment = await this.students.createEnrollment({
			tenantId,
			studentId,
			sectionId: input.sectionId,
			academicYearId: input.academicYearId,
			enrolledOn: input.enrolledOn ?? new Date().toISOString().slice(0, 10),
			status: 'active',
		});
		return { enrollment: toPublicEnrollment(enrollment) };
	}

	async updateEnrollment(
		userId: string,
		tenantId: string,
		enrollmentId: string,
		input: UpdateEnrollmentInput,
	) {
		await this.requireWrite(userId, tenantId);
		const enrollment = await this.requireEnrollment(tenantId, enrollmentId);

		if (input.status === 'active') {
			const existing = await this.students.findActiveEnrollmentForYear(
				tenantId,
				enrollment.studentId,
				enrollment.academicYearId,
			);
			if (existing && existing.id !== enrollmentId) {
				throw new ConflictException({
					code: 'ACTIVE_ENROLLMENT_EXISTS',
					message: 'Student already has an active enrollment for this academic year',
				});
			}
		}

		const updated = await this.students.updateEnrollment(tenantId, enrollmentId, {
			status: input.status,
		});
		if (!updated) {
			throw new NotFoundException({
				code: 'ENROLLMENT_NOT_FOUND',
				message: 'Enrollment not found',
			});
		}
		return { enrollment: toPublicEnrollment(updated) };
	}

	private async requireRead(userId: string, tenantId: string) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.STUDENTS_READ);
	}

	private async requireWrite(userId: string, tenantId: string) {
		await this.membershipAccess.requirePermission(userId, tenantId, PermissionCodes.STUDENTS_WRITE);
	}

	private async requireStudent(tenantId: string, studentId: string) {
		const student = await this.students.findStudentById(tenantId, studentId);
		if (!student) {
			throw new NotFoundException({
				code: 'STUDENT_NOT_FOUND',
				message: 'Student not found',
			});
		}
		return student;
	}

	private async requireEnrollment(tenantId: string, enrollmentId: string) {
		const enrollment = await this.students.findEnrollmentById(tenantId, enrollmentId);
		if (!enrollment) {
			throw new NotFoundException({
				code: 'ENROLLMENT_NOT_FOUND',
				message: 'Enrollment not found',
			});
		}
		return enrollment;
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
}
