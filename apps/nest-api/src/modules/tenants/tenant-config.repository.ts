import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { tenantBranding, tenantCommunicationPolicies, tenantSettings } from '@/database/schema';

@Injectable()
export class TenantConfigRepository {
	constructor(private readonly database: DatabaseService) {}

	async ensureDefaults(tenantId: string, tenantName: string) {
		await this.database.db.transaction(async (transaction) => {
			await transaction
				.insert(tenantSettings)
				.values({ tenantId })
				.onConflictDoNothing({ target: tenantSettings.tenantId });

			await transaction
				.insert(tenantBranding)
				.values({ tenantId, displayNameEn: tenantName })
				.onConflictDoNothing({ target: tenantBranding.tenantId });

			await transaction
				.insert(tenantCommunicationPolicies)
				.values({ tenantId })
				.onConflictDoNothing({ target: tenantCommunicationPolicies.tenantId });
		});
	}

	async findByTenantId(tenantId: string) {
		const [[settings], [branding], [communicationPolicy]] = await Promise.all([
			this.database.db
				.select()
				.from(tenantSettings)
				.where(eq(tenantSettings.tenantId, tenantId))
				.limit(1),
			this.database.db
				.select()
				.from(tenantBranding)
				.where(eq(tenantBranding.tenantId, tenantId))
				.limit(1),
			this.database.db
				.select()
				.from(tenantCommunicationPolicies)
				.where(eq(tenantCommunicationPolicies.tenantId, tenantId))
				.limit(1),
		]);

		return {
			settings: settings ?? null,
			branding: branding ?? null,
			communicationPolicy: communicationPolicy ?? null,
		};
	}

	async updateSettings(tenantId: string, input: Partial<typeof tenantSettings.$inferInsert>) {
		const [settings] = await this.database.db
			.update(tenantSettings)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(tenantSettings.tenantId, tenantId))
			.returning();
		return settings ?? null;
	}

	async updateBranding(tenantId: string, input: Partial<typeof tenantBranding.$inferInsert>) {
		const [branding] = await this.database.db
			.update(tenantBranding)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(tenantBranding.tenantId, tenantId))
			.returning();
		return branding ?? null;
	}

	async updateCommunicationPolicy(
		tenantId: string,
		input: Partial<typeof tenantCommunicationPolicies.$inferInsert>,
	) {
		const [communicationPolicy] = await this.database.db
			.update(tenantCommunicationPolicies)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(tenantCommunicationPolicies.tenantId, tenantId))
			.returning();
		return communicationPolicy ?? null;
	}
}
