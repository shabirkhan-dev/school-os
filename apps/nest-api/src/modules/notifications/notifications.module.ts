import { Module } from '@nestjs/common';

import { AttendanceMarkedOutboxHandler } from './handlers/attendance-marked-outbox.handler';
import { OutboxRepository } from './outbox.repository';
import { OutboxDispatchService } from './outbox-dispatch.service';
import { OutboxProcessorService } from './outbox-processor.service';

@Module({
	providers: [
		OutboxRepository,
		OutboxDispatchService,
		OutboxProcessorService,
		AttendanceMarkedOutboxHandler,
	],
	exports: [OutboxRepository, OutboxDispatchService, OutboxProcessorService],
})
export class NotificationsModule {}
