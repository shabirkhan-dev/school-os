import { Injectable } from '@nestjs/common';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { type OutboxEventRecord, outboxEvents } from '@/database/schema';

@Injectable()
export class OutboxRepository {
	constructor(private readonly database: DatabaseService) {}

	async claimPendingBatch(limit: number): Promise<OutboxEventRecord[]> {
		if (limit <= 0) {
			return [];
		}

		return this.database.db
			.update(outboxEvents)
			.set({ status: 'processing' })
			.where(
				and(
					eq(outboxEvents.status, 'pending'),
					inArray(
						outboxEvents.id,
						this.database.db
							.select({ id: outboxEvents.id })
							.from(outboxEvents)
							.where(eq(outboxEvents.status, 'pending'))
							.orderBy(outboxEvents.createdAt)
							.limit(limit)
							.for('update'),
					),
				),
			)
			.returning();
	}

	async markProcessed(eventId: string): Promise<void> {
		await this.database.db
			.update(outboxEvents)
			.set({ status: 'processed', processedAt: new Date() })
			.where(eq(outboxEvents.id, eventId));
	}

	async markFailed(eventId: string): Promise<void> {
		await this.database.db
			.update(outboxEvents)
			.set({ status: 'failed', processedAt: new Date() })
			.where(eq(outboxEvents.id, eventId));
	}
}
