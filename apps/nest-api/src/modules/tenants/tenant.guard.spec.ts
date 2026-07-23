import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, type Mocked, vi } from 'vitest';

import type { AccessTokenPayload } from '@/modules/auth/auth.types';
import type { AuthenticatedRequest } from '@/modules/auth/jwt-auth.guard';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import { TenantGuard } from './tenant.guard';

describe('TenantGuard', () => {
	let memberships: Mocked<MembershipsService>;
	let guard: TenantGuard;

	beforeEach(() => {
		memberships = {
			requireActiveMembership: vi.fn(),
		} as unknown as Mocked<MembershipsService>;
		guard = new TenantGuard(memberships);
	});

	it('returns 404 when jwt tenant does not match route tenant', async () => {
		const request = {
			user: { sub: 'user-id', sid: 'session-id', tid: 'tenant-a', mid: 'membership-a' },
			params: { tenantId: 'tenant-b' },
		} as AuthenticatedRequest & { params: { tenantId: string } };

		await expect(
			guard.canActivate({
				switchToHttp: () => ({ getRequest: () => request }),
			} as never),
		).rejects.toBeInstanceOf(NotFoundException);
	});

	it('attaches tenant context when membership is active', async () => {
		const user: AccessTokenPayload = {
			sub: 'user-id',
			sid: 'session-id',
			tid: 'tenant-a',
			mid: 'membership-a',
		};
		const request = {
			user,
			params: { tenantId: 'tenant-a' },
		} as AuthenticatedRequest & { params: { tenantId: string }; tenant?: unknown };

		memberships.requireActiveMembership.mockResolvedValue({
			id: 'membership-a',
			tenantId: 'tenant-a',
			userId: 'user-id',
			campusId: null,
			role: 'owner',
			status: 'active',
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await expect(
			guard.canActivate({
				switchToHttp: () => ({ getRequest: () => request }),
			} as never),
		).resolves.toBe(true);

		expect(request.tenant).toEqual({
			tenantId: 'tenant-a',
			membershipId: 'membership-a',
			userId: 'user-id',
			role: 'owner',
			campusId: null,
		});
	});
});
