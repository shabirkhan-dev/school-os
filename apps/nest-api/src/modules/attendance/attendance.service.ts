import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import type { MembershipRecord } from '@/database/schema';
import { AcademicRepository } from '@/modules/academic/academic.repository';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import { StudentsRepository } from '@/modules/students/students.repository';
import type { CreateAttendanceSessionInput, MarkAttendanceInput } from './attendance.dto';
import { AttendanceRepository } from './attendance.repository';
import { countMarksByStatus, toPublicMark, toPublicSession } from './attendance.types';

const managementRoles = new Set<MembershipRecord['role']>(['owner', 'principal', 'admin']);

@Injectable()
export class AttendanceService {
	constructor(
		private readonly attendance: AttendanceRepository,
		private readonly academic: AcademicRepository,
		private readonly students: StudentsRepository,
		private readonly membershipAccess: MembershipsService,
	) {}

	async getOrCreateSession(userId: string, tenantId: string, input: CreateAttendanceSessionInput) {
		const section = await this.requireSection(tenantId, input.sectionId);
		const sessionDate = input.sessionDate;

		const existing = await this.attendance.findSessionBySectionAndDate(
			tenantId,
			input.sectionId,
			sessionDate,
		);
		if (existing) {
			await this.requireRead(userId, tenantId);
			return this.buildSessionResponse(tenantId, existing);
		}

		const membership = await this.requireMark(userId, tenantId);
		this.requireSectionMarkAccess(membership, section);

		const session = await this.attendance.createSession({
			tenantId,
			campusId: section.campusId,
			sectionId: input.sectionId,
			sessionType: input.sessionType ?? 'class',
			sessionDate,
		});
		if (!session) {
			throw new BadRequestException({
				code: 'ATTENDANCE_SESSION_CREATE_FAILED',
				message: 'Could not create attendance session',
			});
		}

		return this.buildSessionResponse(tenantId, session);
	}

	async getSession(userId: string, tenantId: string, sessionId: string) {
		await this.requireRead(userId, tenantId);
		const session = await this.requireSession(tenantId, sessionId);
		return this.buildSessionResponse(tenantId, session);
	}

	async findSession(
		userId: string,
		tenantId: string,
		filters: { sectionId: string; sessionDate: string },
	) {
		await this.requireRead(userId, tenantId);
		await this.requireSection(tenantId, filters.sectionId);

		const session = await this.attendance.findSessionBySectionAndDate(
			tenantId,
			filters.sectionId,
			filters.sessionDate,
		);
		if (!session) {
			throw new NotFoundException({
				code: 'ATTENDANCE_SESSION_NOT_FOUND',
				message: 'Attendance session not found for this section and date',
			});
		}

		return this.buildSessionResponse(tenantId, session);
	}

	async markAttendance(
		userId: string,
		tenantId: string,
		sessionId: string,
		input: MarkAttendanceInput,
	) {
		const membership = await this.requireMark(userId, tenantId);
		const session = await this.requireSession(tenantId, sessionId);
		const section = session.sectionId
			? await this.requireSection(tenantId, session.sectionId)
			: null;

		if (section) {
			this.requireSectionMarkAccess(membership, section);
		}

		const enrolled = await this.students.listEnrollments(tenantId, {
			sectionId: session.sectionId ?? undefined,
		});
		const activeStudentIds = new Set(
			enrolled.filter((row) => row.status === 'active').map((row) => row.studentId),
		);

		for (const mark of input.marks) {
			const student = await this.students.findStudentById(tenantId, mark.studentId);
			if (!student) {
				throw new NotFoundException({
					code: 'STUDENT_NOT_FOUND',
					message: `Student ${mark.studentId} not found`,
				});
			}
			if (session.sectionId && !activeStudentIds.has(mark.studentId)) {
				throw new BadRequestException({
					code: 'STUDENT_NOT_ENROLLED',
					message: 'Student is not actively enrolled in this section',
				});
			}
		}

		const marks = await this.attendance.markStudents({
			tenantId,
			session,
			marks: input.marks,
			markedByMembershipId: membership.id,
		});

		return {
			marks: marks.map(toPublicMark),
			summary: countMarksByStatus(marks),
		};
	}

	async getStudentHistory(userId: string, tenantId: string, studentId: string, limit?: number) {
		await this.requireRead(userId, tenantId);
		const student = await this.students.findStudentById(tenantId, studentId);
		if (!student) {
			throw new NotFoundException({
				code: 'STUDENT_NOT_FOUND',
				message: 'Student not found',
			});
		}

		const rows = await this.attendance.listMarksForStudent(tenantId, studentId, limit ?? 50);
		return {
			history: rows.map((row) => ({
				mark: toPublicMark(row.mark),
				session: toPublicSession(row.session),
			})),
		};
	}

	private async buildSessionResponse(
		tenantId: string,
		session: NonNullable<Awaited<ReturnType<AttendanceRepository['findSessionById']>>>,
	) {
		const marks = await this.attendance.listMarksForSession(tenantId, session.id);
		return {
			session: toPublicSession(session),
			marks: marks.map(toPublicMark),
			summary: countMarksByStatus(marks),
		};
	}

	private requireSectionMarkAccess(
		membership: MembershipRecord,
		section: NonNullable<Awaited<ReturnType<AcademicRepository['findSectionById']>>>,
	) {
		if (managementRoles.has(membership.role)) return;
		if (membership.role !== 'teacher') {
			throw new ForbiddenException({
				code: 'ATTENDANCE_MARK_FORBIDDEN',
				message: 'You cannot mark attendance for this section',
			});
		}
		if (section.homeroomTeacherMembershipId !== membership.id) {
			throw new ForbiddenException({
				code: 'ATTENDANCE_SECTION_NOT_ASSIGNED',
				message: 'You are not assigned as the homeroom teacher for this section',
			});
		}
	}

	private async requireRead(userId: string, tenantId: string) {
		return this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.ATTENDANCE_READ,
		);
	}

	private async requireMark(userId: string, tenantId: string) {
		return this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.ATTENDANCE_MARK,
		);
	}

	private async requireSession(tenantId: string, sessionId: string) {
		const session = await this.attendance.findSessionById(tenantId, sessionId);
		if (!session) {
			throw new NotFoundException({
				code: 'ATTENDANCE_SESSION_NOT_FOUND',
				message: 'Attendance session not found',
			});
		}
		return session;
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
}
