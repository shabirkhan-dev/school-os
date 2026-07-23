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

	it('returns and updates organization config for tenant owners', async () => {
		const getConfig = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/organization-config`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		expect(getConfig.body.data.config.settings.attendanceGraceMinutes).toBe(15);
		expect(getConfig.body.data.config.branding.displayNameEn).toBeTruthy();
		expect(getConfig.body.data.config.communicationPolicy.whatsappEnabled).toBe(true);

		const patchConfig = await request(app.getHttpServer())
			.patch(`/api/v1/tenants/${tenantId}/organization-config`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				settings: { attendanceGraceMinutes: 20 },
				branding: { displayNameUr: 'AKES' },
				communicationPolicy: { notifyAllGuardians: true },
			})
			.expect(200);

		expect(patchConfig.body.data.config.settings.attendanceGraceMinutes).toBe(20);
		expect(patchConfig.body.data.config.branding.displayNameUr).toBe('AKES');
		expect(patchConfig.body.data.config.communicationPolicy.notifyAllGuardians).toBe(true);
	});

	it('creates academic years, classes, and sections for tenant owners', async () => {
		const campuses = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/campuses`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		const campusId = campuses.body.data.campuses[0].id as string;

		const createYear = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/academic-years`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: '2026–27',
				startsOn: '2026-04-01',
				endsOn: '2027-03-31',
				status: 'active',
			})
			.expect(201);

		const academicYearId = createYear.body.data.academicYear.id as string;
		expect(createYear.body.data.academicYear.status).toBe('active');

		const createClass = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/classes`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ name: 'Grade 7', sortOrder: 7 })
			.expect(201);

		const classId = createClass.body.data.class.id as string;

		const createSection = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/sections`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				campusId,
				classId,
				academicYearId,
				name: '7-B',
			})
			.expect(201);

		expect(createSection.body.data.section.name).toBe('7-B');

		const listSections = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/sections`)
			.set('Authorization', `Bearer ${accessToken}`)
			.query({ campusId, academicYearId })
			.expect(200);

		expect(listSections.body.data.sections).toHaveLength(1);
	});

	it('creates students and enrolls them into sections', async () => {
		const campuses = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/campuses`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		const campusId = campuses.body.data.campuses[0].id as string;

		const createYear = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/academic-years`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: '2026–27 Students',
				startsOn: '2026-04-01',
				endsOn: '2027-03-31',
				status: 'active',
			})
			.expect(201);

		const academicYearId = createYear.body.data.academicYear.id as string;

		const createClass = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/classes`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ name: 'Grade 8', sortOrder: 8 })
			.expect(201);

		const classId = createClass.body.data.class.id as string;

		const createSection = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/sections`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				campusId,
				classId,
				academicYearId,
				name: '8-A',
			})
			.expect(201);

		const sectionId = createSection.body.data.section.id as string;

		const createStudent = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/students`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				campusId,
				studentCode: 'E2E-2026-001',
				firstName: 'Amara',
				lastName: 'Okafor',
			})
			.expect(201);

		const studentId = createStudent.body.data.student.id as string;
		expect(createStudent.body.data.student.studentCode).toBe('E2E-2026-001');

		const createEnrollment = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/students/${studentId}/enrollments`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ sectionId, academicYearId })
			.expect(201);

		expect(createEnrollment.body.data.enrollment.sectionId).toBe(sectionId);

		const listStudents = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/students`)
			.set('Authorization', `Bearer ${accessToken}`)
			.query({ campusId })
			.expect(200);

		expect(
			listStudents.body.data.students.some((student: { id: string }) => student.id === studentId),
		).toBe(true);
	});

	it('marks attendance for enrolled students', async () => {
		const campuses = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/campuses`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		const campusId = campuses.body.data.campuses[0].id as string;

		const createYear = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/academic-years`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				name: '2026–27 Attendance',
				startsOn: '2026-04-01',
				endsOn: '2027-03-31',
				status: 'active',
			})
			.expect(201);

		const academicYearId = createYear.body.data.academicYear.id as string;

		const createClass = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/classes`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ name: 'Grade 9', sortOrder: 9 })
			.expect(201);

		const classId = createClass.body.data.class.id as string;

		const createSection = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/sections`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				campusId,
				classId,
				academicYearId,
				name: '9-A',
			})
			.expect(201);

		const sectionId = createSection.body.data.section.id as string;

		const createStudent = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/students`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				campusId,
				studentCode: 'E2E-ATT-001',
				firstName: 'Zara',
				lastName: 'Malik',
			})
			.expect(201);

		const studentId = createStudent.body.data.student.id as string;

		await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/students/${studentId}/enrollments`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ sectionId, academicYearId })
			.expect(201);

		const sessionResponse = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/attendance/sessions`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ sectionId, sessionDate: '2026-07-23' })
			.expect(201);

		const sessionId = sessionResponse.body.data.session.id as string;

		const markResponse = await request(app.getHttpServer())
			.post(`/api/v1/tenants/${tenantId}/attendance/sessions/${sessionId}/marks`)
			.set('Authorization', `Bearer ${accessToken}`)
			.send({ marks: [{ studentId, status: 'present' }] })
			.expect(201);

		expect(markResponse.body.data.summary.present).toBe(1);

		const historyResponse = await request(app.getHttpServer())
			.get(`/api/v1/tenants/${tenantId}/attendance/students/${studentId}/history`)
			.set('Authorization', `Bearer ${accessToken}`)
			.expect(200);

		expect(historyResponse.body.data.history).toHaveLength(1);
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
