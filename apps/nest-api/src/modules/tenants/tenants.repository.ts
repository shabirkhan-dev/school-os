import { Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import {
	membershipRoles,
	memberships,
	type TenantRecord,
	tenantBranding,
	tenantCommunicationPolicies,
	tenantSettings,
	tenants,
} from '@/database/schema';

@Injectable()
export class TenantsRepository {
	constructor(private readonly database: DatabaseService) {}

	async findById(id: string) {
		const [tenant] = await this.database.db
			.select()
			.from(tenants)
			.where(and(eq(tenants.id, id), isNull(tenants.deletedAt)))
			.limit(1);
		return tenant ?? null;
	}

	async findBySlug(slug: string) {
		const [tenant] = await this.database.db
			.select()
			.from(tenants)
			.where(and(eq(tenants.slug, slug), isNull(tenants.deletedAt)))
			.limit(1);
		return tenant ?? null;
	}

	async listByIds(ids: string[]) {
		if (ids.length === 0) return [];
		return this.database.db
			.select()
			.from(tenants)
			.where(and(inArray(tenants.id, ids), isNull(tenants.deletedAt)))
			.orderBy(tenants.name);
	}

	async createWithOwnerMembership(input: { tenant: typeof tenants.$inferInsert; userId: string }) {
		return this.database.db.transaction(async (transaction) => {
			const [tenant] = await transaction.insert(tenants).values(input.tenant).returning();
			if (!tenant) throw new Error('Tenant insert did not return a record');

			const [membership] = await transaction
				.insert(memberships)
				.values({
					tenantId: tenant.id,
					userId: input.userId,
					role: 'owner',
					status: 'active',
				})
				.returning();
			if (!membership) throw new Error('Membership insert did not return a record');

			await transaction.insert(membershipRoles).values({
				membershipId: membership.id,
				role: 'owner',
			});

			await transaction.insert(tenantSettings).values({ tenantId: tenant.id });
			await transaction.insert(tenantBranding).values({
				tenantId: tenant.id,
				displayNameEn: tenant.name,
			});
			await transaction.insert(tenantCommunicationPolicies).values({ tenantId: tenant.id });

			return tenant;
		});
	}

	async update(id: string, input: Partial<typeof tenants.$inferInsert>) {
		const [tenant] = await this.database.db
			.update(tenants)
			.set({ ...input, updatedAt: new Date() })
			.where(and(eq(tenants.id, id), isNull(tenants.deletedAt)))
			.returning();
		return tenant ?? null;
	}

	async slugExists(slug: string, excludeTenantId?: string) {
		const existing = await this.findBySlug(slug);
		if (!existing) return false;
		return excludeTenantId ? existing.id !== excludeTenantId : true;
	}

	isActive(tenant: TenantRecord) {
		return tenant.status === 'active' && tenant.deletedAt === null;
	}
}
