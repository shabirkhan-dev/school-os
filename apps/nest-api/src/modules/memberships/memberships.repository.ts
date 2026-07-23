import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { memberships } from '@/database/schema';

@Injectable()
export class MembershipsRepository {
	constructor(private readonly database: DatabaseService) {}

	async findActiveByTenantAndUser(tenantId: string, userId: string) {
		const [membership] = await this.database.db
			.select()
			.from(memberships)
			.where(
				and(
					eq(memberships.tenantId, tenantId),
					eq(memberships.userId, userId),
					eq(memberships.status, 'active'),
				),
			)
			.limit(1);
		return membership ?? null;
	}

	async findActiveById(membershipId: string) {
		const [membership] = await this.database.db
			.select()
			.from(memberships)
			.where(and(eq(memberships.id, membershipId), eq(memberships.status, 'active')))
			.limit(1);
		return membership ?? null;
	}

	async countActiveForUser(userId: string) {
		const rows = await this.listActiveTenantIdsForUser(userId);
		return rows.length;
	}

	async listActiveTenantIdsForUser(userId: string) {
		const rows = await this.database.db
			.select({ tenantId: memberships.tenantId })
			.from(memberships)
			.where(and(eq(memberships.userId, userId), eq(memberships.status, 'active')));
		return rows.map((row) => row.tenantId);
	}

	async create(input: typeof memberships.$inferInsert) {
		const [membership] = await this.database.db.insert(memberships).values(input).returning();
		if (!membership) throw new Error('Membership insert did not return a record');
		return membership;
	}
}
