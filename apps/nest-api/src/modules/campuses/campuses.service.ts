import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

import { PermissionCodes } from '@/modules/authorization/permission-codes';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import type { CreateCampusInput, UpdateCampusInput } from './campuses.dto';
import { CampusesRepository } from './campuses.repository';
import { toPublicCampus } from './campuses.types';

@Injectable()
export class CampusesService {
	constructor(
		private readonly campuses: CampusesRepository,
		private readonly membershipAccess: MembershipsService,
	) {}

	async create(userId: string, tenantId: string, input: CreateCampusInput) {
		await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.TENANT_CAMPUS_CREATE,
		);

		const code = input.code.trim().toUpperCase();
		if (await this.campuses.findByCodeForTenant(tenantId, code)) {
			throw new ConflictException({
				code: 'CAMPUS_CODE_ALREADY_EXISTS',
				message: 'A campus with this code already exists in the tenant',
			});
		}

		const campus = await this.campuses.create({
			tenantId,
			name: input.name.trim(),
			code,
			address: input.address?.trim() ?? null,
			geoLat: input.geoLat ?? null,
			geoLng: input.geoLng ?? null,
		});
		return { campus: toPublicCampus(campus) };
	}

	async list(userId: string, tenantId: string) {
		await this.membershipAccess.requireActiveMembership(userId, tenantId);
		const rows = await this.campuses.listByTenant(tenantId);
		return { campuses: rows.map(toPublicCampus) };
	}

	async get(userId: string, tenantId: string, campusId: string) {
		await this.membershipAccess.requireActiveMembership(userId, tenantId);
		const campus = await this.requireCampus(tenantId, campusId);
		return { campus: toPublicCampus(campus) };
	}

	async update(userId: string, tenantId: string, campusId: string, input: UpdateCampusInput) {
		await this.membershipAccess.requirePermission(
			userId,
			tenantId,
			PermissionCodes.TENANT_CAMPUS_UPDATE,
		);

		const campus = await this.campuses.update(tenantId, campusId, {
			name: input.name?.trim(),
			address: input.address === undefined ? undefined : (input.address?.trim() ?? null),
			geoLat: input.geoLat === undefined ? undefined : input.geoLat,
			geoLng: input.geoLng === undefined ? undefined : input.geoLng,
			status: input.status,
		});
		if (!campus) {
			throw new NotFoundException({
				code: 'CAMPUS_NOT_FOUND',
				message: 'Campus not found',
			});
		}
		return { campus: toPublicCampus(campus) };
	}

	private async requireCampus(tenantId: string, campusId: string) {
		const campus = await this.campuses.findByIdForTenant(tenantId, campusId);
		if (!campus) {
			throw new NotFoundException({
				code: 'CAMPUS_NOT_FOUND',
				message: 'Campus not found',
			});
		}
		return campus;
	}
}
