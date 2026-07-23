import { describe, expect, it } from 'vitest';

import type { NavigationItemRecord } from '@/database/schema';
import { NavigationService } from './navigation.service';

function navRow(
	overrides: Partial<NavigationItemRecord> &
		Pick<NavigationItemRecord, 'id' | 'key' | 'label' | 'sectionHeading'>,
): NavigationItemRecord {
	return {
		href: null,
		iconKey: null,
		parentId: null,
		requiredPermission: null,
		visibleToRoles: null,
		sortOrder: 0,
		isEnabled: true,
		surface: 'admin',
		createdAt: new Date(),
		updatedAt: new Date(),
		...overrides,
	};
}

describe('NavigationService', () => {
	const service = new NavigationService({ listBySurface: async () => [] } as never);

	it('hides management-only items from teachers even when they have read permissions', () => {
		const rows: NavigationItemRecord[] = [
			navRow({
				id: '1',
				key: 'dashboard',
				label: 'Dashboard',
				href: '/admin',
				sectionHeading: 'Main Menu',
				sortOrder: 10,
			}),
			navRow({
				id: '2',
				key: 'students',
				label: 'Students',
				href: '/admin/students',
				sectionHeading: 'People',
				requiredPermission: 'students.read',
				visibleToRoles: ['owner', 'principal', 'admin'],
				sortOrder: 10,
			}),
			navRow({
				id: '3',
				key: 'my-classes',
				label: 'My classes',
				href: '/admin/my-classes',
				sectionHeading: 'Main Menu',
				requiredPermission: 'academic.read',
				visibleToRoles: ['teacher'],
				sortOrder: 25,
			}),
		];

		const filtered = (
			service as unknown as {
				filterByPermissions: (
					rows: NavigationItemRecord[],
					permissions: readonly string[],
					roles: readonly string[],
				) => NavigationItemRecord[];
			}
		).filterByPermissions(rows, ['students.read', 'academic.read'], ['teacher']);

		expect(filtered.map((item) => item.key)).toEqual(['dashboard', 'my-classes']);
	});

	it('shows management directories to admins', () => {
		const rows: NavigationItemRecord[] = [
			navRow({
				id: '1',
				key: 'students',
				label: 'Students',
				href: '/admin/students',
				sectionHeading: 'People',
				requiredPermission: 'students.read',
				visibleToRoles: ['owner', 'principal', 'admin'],
				sortOrder: 10,
			}),
		];

		const filtered = (
			service as unknown as {
				filterByPermissions: (
					rows: NavigationItemRecord[],
					permissions: readonly string[],
					roles: readonly string[],
				) => NavigationItemRecord[];
			}
		).filterByPermissions(rows, ['students.read'], ['admin']);

		expect(filtered.map((item) => item.key)).toEqual(['students']);
	});
});
