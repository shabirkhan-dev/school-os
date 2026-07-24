import { Injectable, Logger } from '@nestjs/common';

import { type OutboxEventRecord } from '@/database/schema';

import { AttendanceMarkedOutboxHandler } from './handlers/attendance-marked-outbox.handler';

export type OutboxEventHandler = {
	readonly eventType: string;
	handle(event: OutboxEventRecord): Promise<void>;
};

@Injectable()
export class OutboxDispatchService {
	private readonly logger = new Logger(OutboxDispatchService.name);
	private readonly handlers = new Map<string, OutboxEventHandler>();

	constructor(attendanceMarkedHandler: AttendanceMarkedOutboxHandler) {
		this.register(attendanceMarkedHandler);
	}

	register(handler: OutboxEventHandler): void {
		this.handlers.set(handler.eventType, handler);
	}

	async dispatch(event: OutboxEventRecord): Promise<void> {
		const handler = this.handlers.get(event.eventType);
		if (!handler) {
			this.logger.debug(`No outbox handler registered for ${event.eventType}`);
			return;
		}

		await handler.handle(event);
	}
}
