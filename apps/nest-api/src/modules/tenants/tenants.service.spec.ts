import { ConflictException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MembershipsRepository } from '@/modules/memberships/memberships.repository';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import { TenantsRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

describe('TenantsService', () => {
	let service: TenantsService;
	let tenantsRepository: {
		createWithOwnerMembership: ReturnType<typeof vi.fn>;
		slugExists: ReturnType<typeof vi.fn>;
		listByIds: ReturnType<typeof vi.fn>;
		findById: ReturnType<typeof vi.fn>;
		update: ReturnType<typeof vi.fn>;
	};
	let membershipsRepository: {
		listActiveTenantIdsForUser: ReturnType<typeof vi.fn>;
		findActiveByTenantAndUser: ReturnType<typeof vi.fn>;
		canManageTenant: MembershipsRepository['canManageTenant'];
	};

	beforeEach(() => {
		tenantsRepository = {
			createWithOwnerMembership: vi.fn(),
			slugExists: vi.fn(),
			listByIds: vi.fn(),
			findById: vi.fn(),
			update: vi.fn(),
		};
		membershipsRepository = {
			listActiveTenantIdsForUser: vi.fn(),
			findActiveByTenantAndUser: vi.fn(),
			canManageTenant: (role) => role === 'owner' || role === 'principal' || role === 'admin',
		};

		service = new TenantsService(
			tenantsRepository as unknown as TenantsRepository,
			membershipsRepository as unknown as MembershipsRepository,
			new MembershipsService(membershipsRepository as unknown as MembershipsRepository),
		);
	});

	it('creates a tenant with a generated slug and owner membership', async () => {
		const now = new Date('2026-07-23T00:00:00.000Z');
		tenantsRepository.slugExists.mockResolvedValue(false);
		tenantsRepository.createWithOwnerMembership.mockResolvedValue({
			id: 'tenant-1',
			name: 'AKES Network',
			slug: 'akes-network',
			mission: null,
			status: 'active',
			timezone: 'Asia/Karachi',
			defaultLocale: 'en',
			deletedAt: null,
			createdAt: now,
			updatedAt: now,
		});

		const result = await service.create('user-1', { name: 'AKES Network' });

		expect(tenantsRepository.createWithOwnerMembership).toHaveBeenCalledWith({
			tenant: {
				name: 'AKES Network',
				slug: 'akes-network',
				mission: null,
				timezone: 'Asia/Karachi',
				defaultLocale: 'en',
			},
			userId: 'user-1',
		});
		expect(result.tenant.slug).toBe('akes-network');
	});

	it('deduplicates slug collisions', async () => {
		tenantsRepository.slugExists
			.mockResolvedValueOnce(true)
			.mockResolvedValueOnce(false)
			.mockResolvedValue(false);
		tenantsRepository.createWithOwnerMembership.mockResolvedValue({
			id: 'tenant-2',
			name: 'Demo School',
			slug: 'demo-school-2',
			mission: null,
			status: 'active',
			timezone: 'Asia/Karachi',
			defaultLocale: 'en',
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await service.create('user-1', { name: 'Demo School' });

		expect(tenantsRepository.createWithOwnerMembership).toHaveBeenCalledWith(
			expect.objectContaining({
				tenant: expect.objectContaining({ slug: 'demo-school-2' }),
			}),
		);
	});

	it('rejects invalid slug derivation', async () => {
		await expect(service.create('user-1', { name: '!!!' })).rejects.toBeInstanceOf(
			ConflictException,
		);
	});
});
