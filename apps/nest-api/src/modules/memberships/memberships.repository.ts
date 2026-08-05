import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import {
	type MembershipRecord,
	membershipInvites,
	membershipRoles,
	memberships,
	users,
} from '@/database/schema';

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

	async findByTenantAndUser(tenantId: string, userId: string) {
		const [membership] = await this.database.db
			.select()
			.from(memberships)
			.where(and(eq(memberships.tenantId, tenantId), eq(memberships.userId, userId)))
			.limit(1);
		return membership ?? null;
	}

	async findById(tenantId: string, membershipId: string) {
		const [membership] = await this.database.db
			.select()
			.from(memberships)
			.where(and(eq(memberships.id, membershipId), eq(memberships.tenantId, tenantId)))
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

	async listMembersForTenant(tenantId: string, includeSuspended = false) {
		const conditions = [eq(memberships.tenantId, tenantId)];
		if (!includeSuspended) {
			conditions.push(eq(memberships.status, 'active'));
		}
		return this.database.db
			.select({
				membership: memberships,
				user: {
					id: users.id,
					email: users.email,
					username: users.username,
					emailVerified: users.emailVerifiedAt,
				},
			})
			.from(memberships)
			.innerJoin(users, eq(memberships.userId, users.id))
			.where(and(...conditions))
			.orderBy(asc(users.email));
	}

	async countActiveOwners(tenantId: string, excludeMembershipId?: string) {
		const conditions = [
			eq(memberships.tenantId, tenantId),
			eq(memberships.role, 'owner'),
			eq(memberships.status, 'active'),
		];
		const rows = await this.database.db
			.select({ id: memberships.id })
			.from(memberships)
			.where(and(...conditions));
		if (!excludeMembershipId) return rows.length;
		return rows.filter((row) => row.id !== excludeMembershipId).length;
	}

	async create(input: typeof memberships.$inferInsert) {
		const [membership] = await this.database.db.insert(memberships).values(input).returning();
		if (!membership) throw new Error('Membership insert did not return a record');
		await this.database.db
			.insert(membershipRoles)
			.values({ membershipId: membership.id, role: membership.role })
			.onConflictDoNothing();
		return membership;
	}

	async update(
		tenantId: string,
		membershipId: string,
		input: Partial<typeof memberships.$inferInsert>,
	) {
		const [membership] = await this.database.db
			.update(memberships)
			.set({ ...input, updatedAt: new Date() })
			.where(and(eq(memberships.id, membershipId), eq(memberships.tenantId, tenantId)))
			.returning();
		if (membership?.role) {
			await this.database.db
				.insert(membershipRoles)
				.values({ membershipId: membership.id, role: membership.role })
				.onConflictDoNothing();
		}
		return membership ?? null;
	}

	async listRolesForMembership(membershipId: string) {
		return this.database.db
			.select()
			.from(membershipRoles)
			.where(eq(membershipRoles.membershipId, membershipId));
	}

	async listRolesForMembershipIds(membershipIds: string[]) {
		if (membershipIds.length === 0) return [];
		return this.database.db
			.select()
			.from(membershipRoles)
			.where(inArray(membershipRoles.membershipId, membershipIds));
	}

	async addRole(membershipId: string, role: MembershipRecord['role']) {
		const [row] = await this.database.db
			.insert(membershipRoles)
			.values({ membershipId, role })
			.onConflictDoNothing()
			.returning();
		return row ?? null;
	}

	async removeRole(membershipId: string, role: MembershipRecord['role']) {
		await this.database.db
			.delete(membershipRoles)
			.where(and(eq(membershipRoles.membershipId, membershipId), eq(membershipRoles.role, role)));
	}

	async createInvite(input: typeof membershipInvites.$inferInsert) {
		const [invite] = await this.database.db.insert(membershipInvites).values(input).returning();
		if (!invite) throw new Error('Membership invite insert did not return a record');
		return invite;
	}

	async findPendingInviteByTokenHash(tokenHash: string) {
		const [invite] = await this.database.db
			.select()
			.from(membershipInvites)
			.where(
				and(eq(membershipInvites.tokenHash, tokenHash), eq(membershipInvites.status, 'pending')),
			)
			.limit(1);
		return invite ?? null;
	}

	async findPendingInviteByTenantAndEmail(tenantId: string, email: string) {
		const [invite] = await this.database.db
			.select()
			.from(membershipInvites)
			.where(
				and(
					eq(membershipInvites.tenantId, tenantId),
					eq(membershipInvites.email, email),
					eq(membershipInvites.status, 'pending'),
				),
			)
			.limit(1);
		return invite ?? null;
	}

	async listPendingInvitesForTenant(tenantId: string) {
		return this.database.db
			.select()
			.from(membershipInvites)
			.where(and(eq(membershipInvites.tenantId, tenantId), eq(membershipInvites.status, 'pending')))
			.orderBy(asc(membershipInvites.email));
	}

	async findPendingInviteById(tenantId: string, inviteId: string) {
		const [invite] = await this.database.db
			.select()
			.from(membershipInvites)
			.where(
				and(
					eq(membershipInvites.id, inviteId),
					eq(membershipInvites.tenantId, tenantId),
					eq(membershipInvites.status, 'pending'),
				),
			)
			.limit(1);
		return invite ?? null;
	}

	async findPendingInviteByIdGlobal(inviteId: string) {
		const [invite] = await this.database.db
			.select()
			.from(membershipInvites)
			.where(and(eq(membershipInvites.id, inviteId), eq(membershipInvites.status, 'pending')))
			.limit(1);
		return invite ?? null;
	}

	async listPendingInvitesForEmail(email: string) {
		return this.database.db
			.select()
			.from(membershipInvites)
			.where(and(eq(membershipInvites.email, email), eq(membershipInvites.status, 'pending')))
			.orderBy(asc(membershipInvites.createdAt));
	}

	async updateInvite(inviteId: string, input: Partial<typeof membershipInvites.$inferInsert>) {
		const [invite] = await this.database.db
			.update(membershipInvites)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(membershipInvites.id, inviteId))
			.returning();
		return invite ?? null;
	}

	async expireStaleInvites() {
		await this.database.db
			.update(membershipInvites)
			.set({ status: 'expired', updatedAt: new Date() })
			.where(
				and(eq(membershipInvites.status, 'pending'), sql`${membershipInvites.expiresAt} < now()`),
			);
	}
}

export type TenantMemberRow = MembershipRecord & {
	user: { id: string; email: string; username: string; emailVerified: Date | null };
};
