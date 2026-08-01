import { ForbiddenException, Injectable } from '@nestjs/common';

import type { MembershipRecord } from '@/database/schema';
import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { hasManagementRole } from '@/modules/memberships/membership-roles';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import { StaffRepository } from '@/modules/staff/staff.repository';
import type {
	AttendanceReportQuery,
	GradesReportQuery,
	HomeworkReportQuery,
	OverviewQuery,
} from './reports.dto';
import { ReportsRepository } from './reports.repository';
import type {
	AttendanceReport,
	GradeDistributionBucket,
	GradesReport,
	HomeworkReport,
	ReportOverview,
} from './reports.types';

type StatusCount = { status: string; count: number };

function round2(value: number): number {
	return Math.round(value * 100) / 100;
}

function rate(numerator: number, denominator: number): number | null {
	if (denominator <= 0) return null;
	return round2((numerator / denominator) * 100);
}

function toStatusMap(rows: StatusCount[]): Map<string, number> {
	const map = new Map<string, number>();
	for (const row of rows) {
		map.set(row.status, (map.get(row.status) ?? 0) + row.count);
	}
	return map;
}

@Injectable()
export class ReportsService {
	constructor(
		private readonly reports: ReportsRepository,
		private readonly staff: StaffRepository,
		private readonly membershipAccess: MembershipsService,
	) {}

	async getOverview(
		userId: string,
		tenantId: string,
		query: OverviewQuery,
	): Promise<ReportOverview> {
		const membership = await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.ASSESSMENTS_READ,
		);

		if (query.sectionId) {
			await this.ensureSectionAccess(tenantId, membership, query.sectionId);
		}

		const [studentCount, sectionCount, subjectCount, assessmentCount, attendanceRows] =
			await Promise.all([
				this.reports.countStudents(tenantId, query.sectionId),
				this.reports.countSections(tenantId, query.sectionId),
				this.reports.countSubjects(tenantId, query.sectionId),
				this.reports.countAssessments(tenantId, query.sectionId),
				this.reports.countAttendanceMarksByStatus(tenantId, { sectionId: query.sectionId }),
			]);

		const marks = toStatusMap(attendanceRows);
		const present = marks.get('present') ?? 0;
		const late = marks.get('late') ?? 0;
		const marked = [...marks.values()].reduce((sum, value) => sum + value, 0);

		return {
			tenantId,
			sectionId: query.sectionId ?? null,
			students: studentCount,
			sections: sectionCount,
			subjects: subjectCount,
			assessments: assessmentCount,
			attendance: {
				marked,
				present,
				rate: rate(present + late, marked),
			},
		};
	}

	async getGradesReport(
		userId: string,
		tenantId: string,
		query: GradesReportQuery,
	): Promise<GradesReport> {
		const membership = await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.ASSESSMENTS_READ,
		);
		await this.ensureSectionAccess(tenantId, membership, query.sectionId);

		const [subjectRows, distributionRows, studentRows] = await Promise.all([
			this.reports.gradeAveragesBySubject(tenantId, query.sectionId, query.term),
			this.reports.gradeDistributionBySubject(tenantId, query.sectionId, query.term),
			this.reports.gradeAveragesByStudent(tenantId, query.sectionId, query.term),
		]);

		const distributionBySubject = new Map<string, GradeDistributionBucket[]>();
		for (const row of distributionRows) {
			const buckets = distributionBySubject.get(row.subjectId) ?? [];
			buckets.push({ grade: row.grade, count: row.count });
			distributionBySubject.set(row.subjectId, buckets);
		}

		const subjects = subjectRows.map((row) => ({
			subjectId: row.subjectId,
			subjectCode: row.subjectCode,
			subjectName: row.subjectName,
			entryCount: row.entryCount,
			studentCount: row.studentCount,
			averagePercentage: row.averagePercentage == null ? null : round2(row.averagePercentage),
			distribution: distributionBySubject.get(row.subjectId) ?? [],
		}));

		const students = studentRows.map((row) => ({
			studentId: row.studentId,
			studentName: row.studentName,
			studentCode: row.studentCode,
			entryCount: row.entryCount,
			averagePercentage: row.averagePercentage == null ? null : round2(row.averagePercentage),
			averageGradePoint: row.averageGradePoint == null ? null : round2(row.averageGradePoint),
		}));

		const subjectAverages = subjects
			.map((subject) => subject.averagePercentage)
			.filter((value): value is number => value != null);
		const overallAveragePercentage =
			subjectAverages.length > 0
				? round2(subjectAverages.reduce((sum, value) => sum + value, 0) / subjectAverages.length)
				: null;

		return {
			sectionId: query.sectionId,
			term: query.term ?? null,
			overallAveragePercentage,
			subjects,
			students,
		};
	}

	async getAttendanceReport(
		userId: string,
		tenantId: string,
		query: AttendanceReportQuery,
	): Promise<AttendanceReport> {
		const membership = await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.ATTENDANCE_READ,
		);
		await this.ensureSectionAccess(tenantId, membership, query.sectionId);

		const filters = { sectionId: query.sectionId, from: query.from, to: query.to };
		const [statusRows, sessionCount] = await Promise.all([
			this.reports.countAttendanceMarksByStatus(tenantId, filters),
			this.reports.countAttendanceSessions(tenantId, filters),
		]);

		const marks = toStatusMap(statusRows);
		const present = marks.get('present') ?? 0;
		const absent = marks.get('absent') ?? 0;
		const late = marks.get('late') ?? 0;
		const excused = marks.get('excused') ?? 0;
		const leftEarly = marks.get('left_early') ?? 0;
		const unknown = marks.get('unknown') ?? 0;
		const marked = present + absent + late + excused + leftEarly + unknown;

		return {
			sectionId: query.sectionId,
			from: query.from ?? null,
			to: query.to ?? null,
			sessionCount,
			marked,
			present,
			absent,
			late,
			excused,
			leftEarly,
			unknown,
			attendanceRate: rate(present + late, marked),
		};
	}

	async getHomeworkReport(
		userId: string,
		tenantId: string,
		query: HomeworkReportQuery,
	): Promise<HomeworkReport> {
		const membership = await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.HOMEWORK_READ,
		);
		await this.ensureSectionAccess(tenantId, membership, query.sectionId);

		const [assignmentCount, statusRows] = await Promise.all([
			this.reports.countHomeworkAssignments(tenantId, query.sectionId),
			this.reports.countHomeworkSubmissionsByStatus(tenantId, query.sectionId),
		]);

		const submissions = toStatusMap(statusRows);
		const pending = submissions.get('pending') ?? 0;
		const submitted = submissions.get('submitted') ?? 0;
		const late = submissions.get('late') ?? 0;
		const graded = submissions.get('graded') ?? 0;
		const excused = submissions.get('excused') ?? 0;
		const submissionCount = pending + submitted + late + graded + excused;
		const turnedIn = submitted + late + graded;

		return {
			sectionId: query.sectionId,
			assignmentCount,
			submissionCount,
			pending,
			submitted,
			late,
			graded,
			excused,
			submissionRate: rate(turnedIn, submissionCount),
			gradedRate: rate(graded, submissionCount),
		};
	}

	private async ensureSectionAccess(
		tenantId: string,
		membership: MembershipRecord,
		sectionId: string,
	) {
		const roles = await this.membershipAccess.listRoleCodes(membership.id, membership.role);
		if (hasManagementRole(roles)) {
			return;
		}

		const hasAccess = await this.staff.teacherHasSectionAccess(tenantId, membership.id, sectionId);
		if (!hasAccess) {
			throw new ForbiddenException({
				code: 'REPORTS_SECTION_ACCESS_DENIED',
				message: 'You do not have access to this section',
			});
		}
	}
}
