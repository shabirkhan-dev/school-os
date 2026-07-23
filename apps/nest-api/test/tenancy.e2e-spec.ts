import 'dotenv/config';

import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '@/app.module';
import { setupApp } from '@/app.setup';
import { AppConfigService } from '@/config/app-config.service';

describe('Tenancy (e2e)', () => {
	let app: INestApplication<App>;
	let accessToken = '';
	let tenantId = '';
	const email = `tenancy-e2e-${randomUUID()}@example.com`;
	const username = `e2e_${randomUUID().replaceAll('-', '').slice(0, 10)}`;
	const password = 'TenancyE2ePass1';

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		setupApp(app, app.get(AppConfigService));
		await app.init();

		const register = await request(app.getHttpServer())
			.post('/api/v1/auth/register')
			.send({ email, username, password })
			.expect(201);

		const verificationCode = register.body.data.developmentCode as string;
		expect(verificationCode).toMatch(/^\d{6}$/);

		await request(app.getHttpServer())
			.post('/api/v1/auth/verify-email')
			.send({ email, code: verificationCode })
			.expect(200);

		const login = await request(app.getHttpServer())
			.post('/api/v1/auth/login')
			.send({ email, password })
			.expect(200);

		accessToken = login.body.data.accessToken as string;
		expect(accessToken.length).toBeGreaterThan(20);
	});

	it('requires authentication for tenant routes', async () => {
		await request(app.getHttpServer()).get('/api/v1/tenants').expect(401);
		await request(app.getHttpServer())
			.post('/api/v1/tenants')
			.send({ name: 'Unauthorized Tenant' })
			.expect(401);
	});

	it('creates and lists tenants through the HTTP API', async () => {
		const tenantName = `E2E School Network ${randomUUID().slice(0, 8)}`;

		const create = await request(app.getHttpServer())
			.post('/api/v1/tenants')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: tenantName,
				mission: 'End-to-end tenancy test',
			})
			.expect(201);

		tenantId = create.body.data.tenant.id as string;
		expect(create.body.data.tenant.name).toBe(tenantName);
		expect(create.body.data.tenant.slug).toMatch(/^e2e-school-network/);

		const list = await request(app.getHttpServer())
			.get('/api/v1/tenants')
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		expect(list.body.data.tenants.some((tenant: { id: string }) => tenant.id === tenantId)).toBe(
			true,
		);
	});

	it('creates and lists campuses under a tenant', async () => {
		const campusCode = `e2e-${randomUUID().slice(0, 6)}`;

		const create = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/campuses`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: 'E2E Campus',
				code: campusCode,
				address: 'Karachi',
			})
			.expect(201);

		expect(create.body.data.campus.code).toBe(campusCode.toUpperCase());

		const list = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/campuses`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		expect(list.body.data.campuses).toHaveLength(1);
	});

	it('returns 404 for cross-tenant access instead of 403', async () => {
		const response = await request(app.getHttpServer())
			.get('/api/v1/tenants/00000000-0000-4000-8000-000000000001')
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(404);

		expect(response.body.code).toBe('TENANT_NOT_FOUND');
	});

	it('lists the permission catalog for authenticated users', async () => {
		const response = await request(app.getHttpServer())
			.get('/api/v1/permissions')
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		expect(response.body.data.permissions.length).toBeGreaterThanOrEqual(4);
		expect(
			response.body.data.permissions.some(
				(permission: { code: string }) => permission.code === 'tenant.campus.create',
			),
		).toBe(true);
	});

	it('returns membership and permissions for tenant members', async () => {
		const response = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/membership`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		expect(response.body.data.membership.role).toBe('owner');
		expect(response.body.data.membership.permissions).toContain('tenant.campus.create');
	});

	it('includes tenant context on switch-tenant session', async () => {
		const response = await request(app.getHttpServer())
			.post('/api/v1/auth/switch-tenant')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ tenantId })
			.expect(200);

		expect(response.body.data.tenantContext?.tenantId).toBe(tenantId);
		expect(response.body.data.tenantContext?.role).toBe('owner');
		expect(response.body.data.tenantContext?.permissions).toContain('tenant.settings.write');
	});

	it('returns validation errors for invalid tenant input', async () => {
		const response = await request(app.getHttpServer())
			.post('/api/v1/tenants')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ name: 'A' })
			.expect(400);

		expect(response.body.code).toBe('VALIDATION_ERROR');
	});

	afterAll(async () => {
		await app.close();
	});
});
