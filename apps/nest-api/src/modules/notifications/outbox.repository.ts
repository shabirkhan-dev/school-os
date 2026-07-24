import { Injectable } from '@nestjs/common';
import { and, eq, inArray } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { type OutboxEventRecord, outboxEvents } from '@/database/schema';

@Injectable()
export class OutboxRepository {
	constructor(private readonly database: DatabaseService) {}

	async claimPendingBatch(limit: number): Promise<OutboxEventRecord[]> {
		if (limit <= 0) {
			return [];
		}

		return this.database.db.transaction(async (tx) => {
			return tx
				.update(outboxEvents)
				.set({ status: 'processing' })
				.where(
					and(
						eq(outboxEvents.status, 'pending'),
						inArray(
							outboxEvents.id,
							tx
								.select({ id: outboxEvents.id })
								.from(outboxEvents)
								.where(eq(outboxEvents.status, 'pending'))
								.orderBy(outboxEvents.createdAt)
								.limit(limit)
								.for('update', { skipLocked: true }),
						),
					),
				)
				.returning();
		});
	}

	async markProcessed(eventId: string): Promise<void> {
		await this.database.db
			.update(outboxEvents)
			.set({ status: 'processed', processedAt: new Date() })
			.where(and(eq(outboxEvents.id, eventId), eq(outboxEvents.status, 'processing')));
	}

	async markFailed(eventId: string): Promise<void> {
		await this.database.db
			.update(outboxEvents)
			.set({ status: 'failed', processedAt: new Date() })
			.where(and(eq(outboxEvents.id, eventId), eq(outboxEvents.status, 'processing')));
	}
}
