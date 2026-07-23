import { Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { campuses } from '@/database/schema';

@Injectable()
export class CampusesRepository {
	constructor(private readonly database: DatabaseService) {}

	async listByTenant(tenantId: string) {
		return this.database.db
			.select()
			.from(campuses)
			.where(and(eq(campuses.tenantId, tenantId), isNull(campuses.deletedAt)))
			.orderBy(campuses.name);
	}

	async findByIdForTenant(tenantId: string, campusId: string) {
		const [campus] = await this.database.db
			.select()
			.from(campuses)
			.where(
				and(eq(campuses.id, campusId), eq(campuses.tenantId, tenantId), isNull(campuses.deletedAt)),
			)
			.limit(1);
		return campus ?? null;
	}

	async findByCodeForTenant(tenantId: string, code: string) {
		const [campus] = await this.database.db
			.select()
			.from(campuses)
			.where(
				and(eq(campuses.tenantId, tenantId), eq(campuses.code, code), isNull(campuses.deletedAt)),
			)
			.limit(1);
		return campus ?? null;
	}

	async create(input: typeof campuses.$inferInsert) {
		const [campus] = await this.database.db.insert(campuses).values(input).returning();
		if (!campus) throw new Error('Campus insert did not return a record');
		return campus;
	}

	async update(tenantId: string, campusId: string, input: Partial<typeof campuses.$inferInsert>) {
		const [campus] = await this.database.db
			.update(campuses)
			.set({ ...input, updatedAt: new Date() })
			.where(
				and(eq(campuses.id, campusId), eq(campuses.tenantId, tenantId), isNull(campuses.deletedAt)),
			)
			.returning();
		return campus ?? null;
	}
}
