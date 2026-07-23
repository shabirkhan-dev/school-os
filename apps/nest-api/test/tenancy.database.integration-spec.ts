import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppConfigService } from '@/config/app-config.service';
import { DatabaseService } from '@/database/database.service';
import { memberships, tenants, users } from '@/database/schema';
import { PermissionsRepository } from '@/modules/authorization/permissions.repository';
import { PermissionsService } from '@/modules/authorization/permissions.service';
import { CampusesRepository } from '@/modules/campuses/campuses.repository';
import { CampusesService } from '@/modules/campuses/campuses.service';
import { MembershipsRepository } from '@/modules/memberships/memberships.repository';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import { TenantsRepository } from '@/modules/tenants/tenants.repository';
import { TenantsService } from '@/modules/tenants/tenants.service';
import { UsersRepository } from '@/modules/users/users.repository';
import { UsersService } from '@/modules/users/users.service';

describe('database-backed tenancy', () => {
	const config = new AppConfigService();
	const database = new DatabaseService(config);
	const permissionsRepository = new PermissionsRepository(database);
	const permissionsService = new PermissionsService(permissionsRepository);
	const membershipsRepository = new MembershipsRepository(database);
	const membershipsService = new MembershipsService(membershipsRepository, permissionsService);
	const tenantsService = new TenantsService(
		new TenantsRepository(database),
		membershipsRepository,
		membershipsService,
	);
	const campusesService = new CampusesService(new CampusesRepository(database), membershipsService);
	const usersService = new UsersService(new UsersRepository(database));

	const ownerEmail = `tenancy-owner-${randomUUID()}@example.com`;
	const outsiderEmail = `tenancy-outsider-${randomUUID()}@example.com`;
	let ownerUserId = '';
	let outsiderUserId = '';
	let tenantId = '';
	const slug = `integration-${randomUUID().slice(0, 8)}`;

	beforeAll(async () => {
		await permissionsService.refreshCache();

		const owner = await usersService.createUser({
			email: ownerEmail,
			username: `owner_${randomUUID().replaceAll('-', '').slice(0, 10)}`,
			passwordHash: 'hash',
		});
		ownerUserId = owner.id;

		const outsider = await usersService.createUser({
			email: outsiderEmail,
			username: `outsider_${randomUUID().replaceAll('-', '').slice(0, 10)}`,
			passwordHash: 'hash',
		});
		outsiderUserId = outsider.id;
	});

	it('creates tenant with owner membership and campus in one flow', async () => {
		const created = await tenantsService.create(ownerUserId, {
			name: 'Integration School Network',
			slug,
			mission: 'Integration test tenant',
		});
		tenantId = created.tenant.id;

		const [membership] = await database.db
			.select()
			.from(memberships)
			.where(eq(memberships.tenantId, tenantId));
		expect(membership?.userId).toBe(ownerUserId);
		expect(membership?.role).toBe('owner');

		const campus = await campusesService.create(ownerUserId, tenantId, {
			name: 'Main Campus',
			code: 'main-01',
			address: 'Test City',
		});
		expect(campus.campus.code).toBe('MAIN-01');

		const listed = await campusesService.list(ownerUserId, tenantId);
		expect(listed.campuses).toHaveLength(1);
	});

	it('scopes tenant lists and reads to memberships', async () => {
		const ownerList = await tenantsService.listForUser(ownerUserId);
		expect(ownerList.tenants.some((tenant) => tenant.id === tenantId)).toBe(true);

		await expect(tenantsService.getForUser(outsiderUserId, tenantId)).rejects.toMatchObject({
			response: { code: 'TENANT_NOT_FOUND' },
		});
	});

	it('enforces unique campus code per tenant at the database layer', async () => {
		await expect(
			campusesService.create(ownerUserId, tenantId, {
				name: 'Duplicate Campus',
				code: 'MAIN-01',
			}),
		).rejects.toMatchObject({
			response: { code: 'CAMPUS_CODE_ALREADY_EXISTS' },
		});
	});

	it('denies teacher from creating campuses', async () => {
		const teacher = await usersService.createUser({
			email: `tenancy-teacher-${randomUUID()}@example.com`,
			username: `teacher_${randomUUID().replaceAll('-', '').slice(0, 10)}`,
			passwordHash: 'hash',
		});

		await membershipsRepository.create({
			tenantId,
			userId: teacher.id,
			role: 'teacher',
			status: 'active',
		});

		await expect(
			campusesService.create(teacher.id, tenantId, {
				name: 'Teacher Campus',
				code: 'tch-01',
			}),
		).rejects.toMatchObject({
			response: { code: 'PERMISSION_DENIED' },
		});

		await database.db.delete(users).where(eq(users.id, teacher.id));
	});

	afterAll(async () => {
		if (tenantId) {
			await database.db.delete(tenants).where(eq(tenants.id, tenantId));
		}
		await database.db.delete(users).where(eq(users.email, ownerEmail));
		await database.db.delete(users).where(eq(users.email, outsiderEmail));
		await database.onModuleDestroy();
	});
});
