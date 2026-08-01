import { Injectable } from '@nestjs/common';
import { and, count, eq, gte, isNull, lte, sql } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import {
	assessments,
	attendanceMarks,
	attendanceSessions,
	enrollments,
	gradebookEntries,
	homeworkAssignments,
	homeworkSubmissions,
	sectionSubjects,
	sections,
	students,
	subjects,
} from '@/database/schema';

const percentageExpression = sql<number>`avg(case when ${gradebookEntries.totalMarks}::numeric > 0 then ${gradebookEntries.obtainedMarks}::numeric / ${gradebookEntries.totalMarks}::numeric * 100 end)::float`;

@Injectable()
export class ReportsRepository {
	constructor(private readonly database: DatabaseService) {}

	async countStudents(tenantId: string, sectionId?: string): Promise<number> {
		if (sectionId) {
			const [row] = await this.database.db
				.select({ value: count() })
				.from(enrollments)
				.innerJoin(students, eq(enrollments.studentId, students.id))
				.where(
					and(
						eq(enrollments.tenantId, tenantId),
						eq(enrollments.sectionId, sectionId),
						eq(enrollments.status, 'active'),
						isNull(enrollments.deletedAt),
						isNull(students.deletedAt),
					),
				);
			return row?.value ?? 0;
		}

		const [row] = await this.database.db
			.select({ value: count() })
			.from(students)
			.where(
				and(
					eq(students.tenantId, tenantId),
					eq(students.status, 'active'),
					isNull(students.deletedAt),
				),
			);
		return row?.value ?? 0;
	}

	async countSections(tenantId: string, sectionId?: string): Promise<number> {
		const conditions = [eq(sections.tenantId, tenantId), isNull(sections.deletedAt)];
		if (sectionId) {
			conditions.push(eq(sections.id, sectionId));
		} else {
			conditions.push(eq(sections.status, 'active'));
		}

		const [row] = await this.database.db
			.select({ value: count() })
			.from(sections)
			.where(and(...conditions));
		return row?.value ?? 0;
	}

	async countSubjects(tenantId: string, sectionId?: string): Promise<number> {
		if (sectionId) {
			const [row] = await this.database.db
				.select({ value: count() })
				.from(sectionSubjects)
				.innerJoin(subjects, eq(sectionSubjects.subjectId, subjects.id))
				.where(
					and(
						eq(sectionSubjects.tenantId, tenantId),
						eq(sectionSubjects.sectionId, sectionId),
						isNull(subjects.deletedAt),
					),
				);
			return row?.value ?? 0;
		}

		const [row] = await this.database.db
			.select({ value: count() })
			.from(subjects)
			.where(and(eq(subjects.tenantId, tenantId), isNull(subjects.deletedAt)));
		return row?.value ?? 0;
	}

	async countAssessments(tenantId: string, sectionId?: string): Promise<number> {
		if (sectionId) {
			const [row] = await this.database.db
				.select({ value: count() })
				.from(assessments)
				.innerJoin(sectionSubjects, eq(assessments.sectionSubjectId, sectionSubjects.id))
				.where(and(eq(assessments.tenantId, tenantId), eq(sectionSubjects.sectionId, sectionId)));
			return row?.value ?? 0;
		}

		const [row] = await this.database.db
			.select({ value: count() })
			.from(assessments)
			.where(eq(assessments.tenantId, tenantId));
		return row?.value ?? 0;
	}

	async countAttendanceMarksByStatus(
		tenantId: string,
		filters: { sectionId?: string; from?: string; to?: string },
	): Promise<Array<{ status: string; count: number }>> {
		const conditions = [eq(attendanceMarks.tenantId, tenantId)];
		if (filters.sectionId) {
			conditions.push(eq(attendanceSessions.sectionId, filters.sectionId));
		}
		if (filters.from) {
			conditions.push(gte(attendanceSessions.sessionDate, filters.from));
		}
		if (filters.to) {
			conditions.push(lte(attendanceSessions.sessionDate, filters.to));
		}

		return this.database.db
			.select({
				status: attendanceMarks.status,
				count: sql<number>`count(*)::int`,
			})
			.from(attendanceMarks)
			.innerJoin(attendanceSessions, eq(attendanceMarks.sessionId, attendanceSessions.id))
			.where(and(...conditions))
			.groupBy(attendanceMarks.status);
	}

	async countAttendanceSessions(
		tenantId: string,
		filters: { sectionId?: string; from?: string; to?: string },
	): Promise<number> {
		const conditions = [eq(attendanceSessions.tenantId, tenantId)];
		if (filters.sectionId) {
			conditions.push(eq(attendanceSessions.sectionId, filters.sectionId));
		}
		if (filters.from) {
			conditions.push(gte(attendanceSessions.sessionDate, filters.from));
		}
		if (filters.to) {
			conditions.push(lte(attendanceSessions.sessionDate, filters.to));
		}

		const [row] = await this.database.db
			.select({ value: count() })
			.from(attendanceSessions)
			.where(and(...conditions));
		return row?.value ?? 0;
	}

	async gradeAveragesBySubject(
		tenantId: string,
		sectionId: string,
		term?: string,
	): Promise<
		Array<{
			subjectId: string;
			subjectCode: string;
			subjectName: string;
			entryCount: number;
			studentCount: number;
			averagePercentage: number | null;
		}>
	> {
		const conditions = [
			eq(gradebookEntries.tenantId, tenantId),
			eq(gradebookEntries.sectionId, sectionId),
		];
		if (term) {
			conditions.push(eq(gradebookEntries.term, term as never));
		}

		return this.database.db
			.select({
				subjectId: subjects.id,
				subjectCode: subjects.code,
				subjectName: subjects.name,
				entryCount: sql<number>`count(*)::int`,
				studentCount: sql<number>`count(distinct ${gradebookEntries.studentId})::int`,
				averagePercentage: percentageExpression,
			})
			.from(gradebookEntries)
			.innerJoin(subjects, eq(gradebookEntries.subjectId, subjects.id))
			.where(and(...conditions, isNull(subjects.deletedAt)))
			.groupBy(subjects.id, subjects.code, subjects.name)
			.orderBy(subjects.code);
	}

	async gradeDistributionBySubject(
		tenantId: string,
		sectionId: string,
		term?: string,
	): Promise<Array<{ subjectId: string; grade: string; count: number }>> {
		const conditions = [
			eq(gradebookEntries.tenantId, tenantId),
			eq(gradebookEntries.sectionId, sectionId),
		];
		if (term) {
			conditions.push(eq(gradebookEntries.term, term as never));
		}

		return this.database.db
			.select({
				subjectId: gradebookEntries.subjectId,
				grade: gradebookEntries.grade,
				count: sql<number>`count(*)::int`,
			})
			.from(gradebookEntries)
			.where(and(...conditions))
			.groupBy(gradebookEntries.subjectId, gradebookEntries.grade)
			.orderBy(gradebookEntries.subjectId, gradebookEntries.grade);
	}

	async gradeAveragesByStudent(
		tenantId: string,
		sectionId: string,
		term?: string,
	): Promise<
		Array<{
			studentId: string;
			studentName: string;
			studentCode: string;
			entryCount: number;
			averagePercentage: number | null;
			averageGradePoint: number | null;
		}>
	> {
		const conditions = [
			eq(gradebookEntries.tenantId, tenantId),
			eq(gradebookEntries.sectionId, sectionId),
		];
		if (term) {
			conditions.push(eq(gradebookEntries.term, term as never));
		}

		return this.database.db
			.select({
				studentId: students.id,
				studentName: sql<string>`trim(concat(${students.firstName}, ' ', ${students.lastName}))`,
				studentCode: students.studentCode,
				entryCount: sql<number>`count(*)::int`,
				averagePercentage: percentageExpression,
				averageGradePoint: sql<number>`avg(${gradebookEntries.gradePoint}::numeric)::float`,
			})
			.from(gradebookEntries)
			.innerJoin(students, eq(gradebookEntries.studentId, students.id))
			.where(and(...conditions, isNull(students.deletedAt)))
			.groupBy(students.id, students.firstName, students.lastName, students.studentCode)
			.orderBy(students.lastName, students.firstName);
	}

	async countHomeworkAssignments(tenantId: string, sectionId: string): Promise<number> {
		const [row] = await this.database.db
			.select({ value: count() })
			.from(homeworkAssignments)
			.innerJoin(sectionSubjects, eq(homeworkAssignments.sectionSubjectId, sectionSubjects.id))
			.where(
				and(eq(homeworkAssignments.tenantId, tenantId), eq(sectionSubjects.sectionId, sectionId)),
			);
		return row?.value ?? 0;
	}

	async countHomeworkSubmissionsByStatus(
		tenantId: string,
		sectionId: string,
	): Promise<Array<{ status: string; count: number }>> {
		return this.database.db
			.select({
				status: homeworkSubmissions.status,
				count: sql<number>`count(*)::int`,
			})
			.from(homeworkSubmissions)
			.innerJoin(homeworkAssignments, eq(homeworkSubmissions.homeworkId, homeworkAssignments.id))
			.innerJoin(sectionSubjects, eq(homeworkAssignments.sectionSubjectId, sectionSubjects.id))
			.where(
				and(eq(homeworkSubmissions.tenantId, tenantId), eq(sectionSubjects.sectionId, sectionId)),
			)
			.groupBy(homeworkSubmissions.status);
	}
}
