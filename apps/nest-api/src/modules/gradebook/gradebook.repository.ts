import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import {
	academicYears,
	enrollments,
	gradebookEntries,
	sectionSubjects,
	sections,
	students,
	subjects,
} from '@/database/schema';

@Injectable()
export class GradebookRepository {
	constructor(private readonly database: DatabaseService) {}

	async listEntries(
		tenantId: string,
		filters: {
			sectionId: string;
			term: string;
			subjectId?: string;
		},
	) {
		const conditions = [
			eq(gradebookEntries.tenantId, tenantId),
			eq(gradebookEntries.sectionId, filters.sectionId),
			eq(gradebookEntries.term, filters.term as never),
		];
		if (filters.subjectId) {
			conditions.push(eq(gradebookEntries.subjectId, filters.subjectId));
		}

		return this.database.db
			.select({
				entry: gradebookEntries,
				student: students,
				subject: subjects,
			})
			.from(gradebookEntries)
			.innerJoin(students, eq(gradebookEntries.studentId, students.id))
			.innerJoin(subjects, eq(gradebookEntries.subjectId, subjects.id))
			.where(and(...conditions, isNull(students.deletedAt), isNull(subjects.deletedAt)))
			.orderBy(students.lastName, students.firstName, subjects.code);
	}

	async listEntriesForStudent(tenantId: string, studentId: string, term?: string) {
		const conditions = [
			eq(gradebookEntries.tenantId, tenantId),
			eq(gradebookEntries.studentId, studentId),
		];
		if (term) {
			conditions.push(eq(gradebookEntries.term, term as never));
		}

		return this.database.db
			.select({
				entry: gradebookEntries,
				subject: subjects,
				section: sections,
				academicYear: academicYears,
			})
			.from(gradebookEntries)
			.innerJoin(subjects, eq(gradebookEntries.subjectId, subjects.id))
			.innerJoin(sections, eq(gradebookEntries.sectionId, sections.id))
			.innerJoin(academicYears, eq(gradebookEntries.academicYearId, academicYears.id))
			.where(and(...conditions, isNull(subjects.deletedAt), isNull(sections.deletedAt)))
			.orderBy(subjects.code);
	}

	async upsertEntry(input: {
		tenantId: string;
		studentId: string;
		sectionId: string;
		academicYearId: string;
		term: string;
		subjectId: string;
		totalMarks: string;
		obtainedMarks: string;
		grade: string;
		gradePoint: string;
		source: string;
		sourceId: string | null;
		createdByMembershipId: string | null;
	}) {
		const now = new Date();
		const [entry] = await this.database.db
			.insert(gradebookEntries)
			.values({
				tenantId: input.tenantId,
				studentId: input.studentId,
				sectionId: input.sectionId,
				academicYearId: input.academicYearId,
				term: input.term as never,
				subjectId: input.subjectId,
				totalMarks: input.totalMarks,
				obtainedMarks: input.obtainedMarks,
				grade: input.grade,
				gradePoint: input.gradePoint,
				source: input.source as never,
				sourceId: input.sourceId,
				createdByMembershipId: input.createdByMembershipId,
			})
			.onConflictDoUpdate({
				target: [
					gradebookEntries.studentId,
					gradebookEntries.sectionId,
					gradebookEntries.term,
					gradebookEntries.subjectId,
				],
				set: {
					totalMarks: input.totalMarks,
					obtainedMarks: input.obtainedMarks,
					grade: input.grade,
					gradePoint: input.gradePoint,
					source: input.source as never,
					sourceId: input.sourceId,
					createdByMembershipId: input.createdByMembershipId,
					updatedAt: now,
				},
			})
			.returning();
		return entry ?? null;
	}

	async listActiveEnrollmentsForSection(tenantId: string, sectionId: string) {
		return this.database.db
			.select({
				enrollment: enrollments,
				student: students,
			})
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
			)
			.orderBy(students.lastName, students.firstName);
	}

	async listSectionSubjects(tenantId: string, sectionId: string) {
		return this.database.db
			.select({ subject: subjects })
			.from(sectionSubjects)
			.innerJoin(subjects, eq(sectionSubjects.subjectId, subjects.id))
			.where(
				and(
					eq(sectionSubjects.tenantId, tenantId),
					eq(sectionSubjects.sectionId, sectionId),
					isNull(subjects.deletedAt),
				),
			)
			.orderBy(subjects.code);
	}
}
