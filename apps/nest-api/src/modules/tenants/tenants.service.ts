import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { MembershipsRepository } from '@/modules/memberships/memberships.repository';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import type { CreateTenantInput, UpdateTenantInput } from './tenants.dto';
import { TenantsRepository } from './tenants.repository';
import { toPublicTenant } from './tenants.types';

/** Maximum number of active tenants a single user can own/create. */
const MAX_ACTIVE_TENANTS_PER_USER = 5;

@Injectable()
export class TenantsService {
	constructor(
		private readonly tenants: TenantsRepository,
		private readonly memberships: MembershipsRepository,
		private readonly membershipAccess: MembershipsService,
	) {}

	async create(userId: string, input: CreateTenantInput) {
		const activeTenantIds = await this.memberships.listActiveTenantIdsForUser(userId);
		if (activeTenantIds.length >= MAX_ACTIVE_TENANTS_PER_USER) {
			throw new ForbiddenException({
				code: 'TENANT_LIMIT_REACHED',
				message: `You can belong to at most ${MAX_ACTIVE_TENANTS_PER_USER} active organizations`,
			});
		}

		const slug = await this.resolveUniqueSlug(input.name, input.slug);
		const tenant = await this.tenants.createWithOwnerMembership({
			tenant: {
				name: input.name.trim(),
				slug,
				mission: input.mission?.trim() ?? null,
				timezone: input.timezone ?? 'Asia/Karachi',
				defaultLocale: input.defaultLocale ?? 'en',
			},
			userId,
		});
		return { tenant: toPublicTenant(tenant) };
	}

	async listForUser(userId: string) {
		const tenantIds = await this.memberships.listActiveTenantIdsForUser(userId);
		const rows = await this.tenants.listByIds(tenantIds);
		return { tenants: rows.map(toPublicTenant) };
	}

	async getForUser(userId: string, tenantId: string) {
		await this.membershipAccess.requireActiveMembership(userId, tenantId);
		const tenant = await this.requireTenant(tenantId);
		return { tenant: toPublicTenant(tenant) };
	}

	async update(userId: string, tenantId: string, input: UpdateTenantInput) {
		await this.membershipAccess.requireManagementAccess(userId, tenantId);
		const tenant = await this.tenants.update(tenantId, {
			name: input.name?.trim(),
			mission: input.mission === undefined ? undefined : (input.mission?.trim() ?? null),
			timezone: input.timezone,
			defaultLocale: input.defaultLocale,
			status: input.status,
		});
		if (!tenant) {
			throw new NotFoundException({
				code: 'TENANT_NOT_FOUND',
				message: 'Tenant not found',
			});
		}
		return { tenant: toPublicTenant(tenant) };
	}

	private async requireTenant(tenantId: string) {
		const tenant = await this.tenants.findById(tenantId);
		if (!tenant) {
			throw new NotFoundException({
				code: 'TENANT_NOT_FOUND',
				message: 'Tenant not found',
			});
		}
		return tenant;
	}

	private async resolveUniqueSlug(name: string, preferred?: string) {
		const base = preferred ? slugify(preferred) : slugify(name);
		if (!base) {
			throw new ConflictException({
				code: 'TENANT_SLUG_INVALID',
				message: 'Could not derive a valid slug from tenant name',
			});
		}

		let candidate = base;
		let suffix = 2;
		while (await this.tenants.slugExists(candidate)) {
			candidate = `${base}-${suffix}`;
			suffix += 1;
		}
		return candidate;
	}
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 72);
}
