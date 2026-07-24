import { Injectable, Logger } from '@nestjs/common';

import { type OutboxEventRecord } from '@/database/schema';

import { type OutboxEventHandler } from '../outbox-dispatch.service';

type AttendanceMarkedPayload = {
	tenantId: string;
	sessionId: string;
	sectionId: string;
	campusId: string;
	studentId: string;
	status: string;
	sessionDate: string;
	markedAt: string;
};

@Injectable()
export class AttendanceMarkedOutboxHandler implements OutboxEventHandler {
	readonly eventType = 'attendance.manual_marked.v1';

	private readonly logger = new Logger(AttendanceMarkedOutboxHandler.name);

	async handle(event: OutboxEventRecord): Promise<void> {
		const payload = event.payload as AttendanceMarkedPayload;

		this.logger.log(
			`Attendance mark queued for notification pipeline (event=${event.id} tenant=${payload.tenantId} student=${payload.studentId} status=${payload.status})`,
		);
	}
}
