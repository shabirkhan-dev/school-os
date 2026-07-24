import type { CampusRecord } from '@/database/schema';

export type PublicCampus = {
	id: string;
	tenantId: string;
	name: string;
	code: string;
	address: string | null;
	geoLat: number | null;
	geoLng: number | null;
	status: CampusRecord['status'];
	createdAt: string;
	updatedAt: string;
};

export function toPublicCampus(campus: CampusRecord): PublicCampus {
	return {
		id: campus.id,
		tenantId: campus.tenantId,
		name: campus.name,
		code: campus.code,
		address: campus.address,
		geoLat: campus.geoLat,
		geoLng: campus.geoLng,
		status: campus.status,
		createdAt: campus.createdAt.toISOString(),
		updatedAt: campus.updatedAt.toISOString(),
	};
}
