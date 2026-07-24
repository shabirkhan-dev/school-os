import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { type NavigationItemRecord, navigationItems } from '@/database/schema';

@Injectable()
export class NavigationRepository {
	constructor(private readonly database: DatabaseService) {}

	async listBySurface(surface: NavigationItemRecord['surface']): Promise<NavigationItemRecord[]> {
		return this.database.db
			.select()
			.from(navigationItems)
			.where(and(eq(navigationItems.surface, surface), eq(navigationItems.isEnabled, true)))
			.orderBy(asc(navigationItems.sectionHeading), asc(navigationItems.sortOrder));
	}
}
