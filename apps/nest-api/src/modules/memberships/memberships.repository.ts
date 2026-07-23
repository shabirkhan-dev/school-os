import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { type MembershipRecord, memberships } from '@/database/schema';

type MembershipRole = MembershipRecord['role'];

const MANAGEMENT_ROLES = new Set<MembershipRole>(['owner', 'principal', 'admin']);

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

	canManageTenant(role: MembershipRole) {
		return MANAGEMENT_ROLES.has(role);
	}
}
