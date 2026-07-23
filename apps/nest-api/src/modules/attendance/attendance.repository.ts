import { Injectable } from '@nestjs/common';
import { and, desc, eq, inArray } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import {
	type AttendanceMarkRecord,
	type AttendanceSessionRecord,
	attendanceEvents,
	attendanceMarks,
	attendanceSessions,
	auditLogs,
	outboxEvents,
} from '@/database/schema';

type MarkInput = {
	studentId: string;
	status: AttendanceMarkRecord['status'];
};

@Injectable()
export class AttendanceRepository {
	constructor(private readonly database: DatabaseService) {}

	async findSessionBySectionAndDate(tenantId: string, sectionId: string, sessionDate: string) {
		const [session] = await this.database.db
			.select()
			.from(attendanceSessions)
			.where(
				and(
					eq(attendanceSessions.tenantId, tenantId),
					eq(attendanceSessions.sectionId, sectionId),
					eq(attendanceSessions.sessionDate, sessionDate),
				),
			)
			.limit(1);
		return session ?? null;
	}

	async findSessionById(tenantId: string, sessionId: string) {
		const [session] = await this.database.db
			.select()
			.from(attendanceSessions)
			.where(and(eq(attendanceSessions.id, sessionId), eq(attendanceSessions.tenantId, tenantId)))
			.limit(1);
		return session ?? null;
	}

	async createSession(input: typeof attendanceSessions.$inferInsert) {
		const [session] = await this.database.db.insert(attendanceSessions).values(input).returning();
		return session;
	}

	async listMarksForSession(tenantId: string, sessionId: string) {
		return this.database.db
			.select()
			.from(attendanceMarks)
			.where(and(eq(attendanceMarks.tenantId, tenantId), eq(attendanceMarks.sessionId, sessionId)))
			.orderBy(attendanceMarks.studentId);
	}

	async listMarksForStudent(tenantId: string, studentId: string, limit = 50) {
		return this.database.db
			.select({
				mark: attendanceMarks,
				session: attendanceSessions,
			})
			.from(attendanceMarks)
			.innerJoin(attendanceSessions, eq(attendanceMarks.sessionId, attendanceSessions.id))
			.where(and(eq(attendanceMarks.tenantId, tenantId), eq(attendanceMarks.studentId, studentId)))
			.orderBy(desc(attendanceSessions.sessionDate))
			.limit(limit);
	}

	async markStudents(input: {
		tenantId: string;
		session: AttendanceSessionRecord;
		marks: MarkInput[];
		markedByMembershipId: string;
	}) {
		const now = new Date();

		return this.database.db.transaction(async (transaction) => {
			const results: AttendanceMarkRecord[] = [];

			for (const markInput of input.marks) {
				const [existing] = await transaction
					.select()
					.from(attendanceMarks)
					.where(
						and(
							eq(attendanceMarks.sessionId, input.session.id),
							eq(attendanceMarks.studentId, markInput.studentId),
						),
					)
					.limit(1);

				const previousStatus = existing?.status ?? null;
				let mark: AttendanceMarkRecord;

				if (existing) {
					const [updated] = await transaction
						.update(attendanceMarks)
						.set({
							status: markInput.status,
							markedAt: now,
							markedByMembershipId: input.markedByMembershipId,
							updatedAt: now,
						})
						.where(eq(attendanceMarks.id, existing.id))
						.returning();
					if (!updated) throw new Error('Attendance mark update did not return a record');
					mark = updated;
				} else {
					const [created] = await transaction
						.insert(attendanceMarks)
						.values({
							tenantId: input.tenantId,
							sessionId: input.session.id,
							studentId: markInput.studentId,
							status: markInput.status,
							markedAt: now,
							markedByMembershipId: input.markedByMembershipId,
						})
						.returning();
					if (!created) throw new Error('Attendance mark insert did not return a record');
					mark = created;
				}

				const sourceEventId = `manual:${mark.id}:${now.getTime()}`;
				await transaction.insert(attendanceEvents).values({
					tenantId: input.tenantId,
					sessionId: input.session.id,
					studentId: markInput.studentId,
					eventType: 'manual_marked',
					source: 'manual',
					sourceEventId,
					payload: {
						status: markInput.status,
						previousStatus,
						markedByMembershipId: input.markedByMembershipId,
					},
				});

				await transaction.insert(auditLogs).values({
					tenantId: input.tenantId,
					actorMembershipId: input.markedByMembershipId,
					action: 'attendance.marked',
					resourceType: 'attendance_mark',
					resourceId: mark.id,
					metadata: {
						sessionId: input.session.id,
						studentId: markInput.studentId,
						status: markInput.status,
						previousStatus,
					},
				});

				await transaction.insert(outboxEvents).values({
					tenantId: input.tenantId,
					eventType: 'attendance.manual_marked.v1',
					aggregateType: 'attendance_mark',
					aggregateId: mark.id,
					payload: {
						tenantId: input.tenantId,
						sessionId: input.session.id,
						sectionId: input.session.sectionId,
						campusId: input.session.campusId,
						studentId: markInput.studentId,
						status: markInput.status,
						sessionDate: input.session.sessionDate,
						markedAt: now.toISOString(),
					},
					status: 'pending',
				});

				results.push(mark);
			}

			return results;
		});
	}

	async countOutboxEventsForMarks(tenantId: string, markIds: string[]) {
		if (markIds.length === 0) return 0;
		const rows = await this.database.db
			.select({ id: outboxEvents.id })
			.from(outboxEvents)
			.where(
				and(
					eq(outboxEvents.tenantId, tenantId),
					inArray(outboxEvents.aggregateId, markIds),
					eq(outboxEvents.aggregateType, 'attendance_mark'),
				),
			);
		return rows.length;
	}
}
