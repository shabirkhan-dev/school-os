import 'dotenv/config';

import { hash } from 'bcryptjs';
import { and, eq, inArray, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
	gradeFromPercentage,
	gradePointFromPercentage,
} from '../../modules/assessments/assessments.types';
import * as schema from '../schema';
import type { MembershipRecord } from '../schema/memberships.schema';
import { SEED_STUDENT_CODE_PREFIX } from './fixtures';
import { DEMO_ROLE_PASSWORD } from './seed-demo-logins';

const BCRYPT_ROUNDS = 10;
const TEACHER_PASSWORD = 'Teacher@123';

const CAMPUS_CODE = 'NW';
const CAMPUS_NAME = 'Northwood Campus';
const CAMPUS_ADDRESS = 'Plot 12, Block 7, Clifton, Karachi';
const CAMPUS_LAT = 24.8138;
const CAMPUS_LNG = 67.0299;

const SUBJECT_DEFS = [
	{ code: 'ENG', name: 'English', description: 'Language arts and literature' },
	{ code: 'MTH', name: 'Mathematics', description: 'Core mathematics' },
	{ code: 'SCI', name: 'General Science', description: 'Integrated science' },
	{ code: 'URD', name: 'Urdu', description: 'Urdu language and composition' },
] as const;

type Gender = 'male' | 'female';

type StudentDef = {
	firstName: string;
	lastName: string;
	gender: Gender;
	dateOfBirth: string;
	bloodGroup: string;
	guardianFirst: string;
	guardianRelationship: 'father' | 'mother';
};

const SECTION_5A = 'Grade 5-A';
const SECTION_6A = 'Grade 6-A';

const STUDENTS_5A: StudentDef[] = [
	{
		firstName: 'Ahmed',
		lastName: 'Khan',
		gender: 'male',
		dateOfBirth: '2014-03-12',
		bloodGroup: 'B+',
		guardianFirst: 'Imran',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Fatima',
		lastName: 'Malik',
		gender: 'female',
		dateOfBirth: '2014-07-25',
		bloodGroup: 'O+',
		guardianFirst: 'Tariq',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Hamza',
		lastName: 'Sheikh',
		gender: 'male',
		dateOfBirth: '2015-01-08',
		bloodGroup: 'A+',
		guardianFirst: 'Salman',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Zain',
		lastName: 'Hussain',
		gender: 'male',
		dateOfBirth: '2014-11-19',
		bloodGroup: 'AB+',
		guardianFirst: 'Asad',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Mariam',
		lastName: 'Raza',
		gender: 'female',
		dateOfBirth: '2015-05-30',
		bloodGroup: 'O+',
		guardianFirst: 'Naveed',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Omar',
		lastName: 'Butt',
		gender: 'male',
		dateOfBirth: '2014-09-03',
		bloodGroup: 'B+',
		guardianFirst: 'Kashif',
		guardianRelationship: 'father',
	},
];

const STUDENTS_6A: StudentDef[] = [
	{
		firstName: 'Ayesha',
		lastName: 'Ali',
		gender: 'female',
		dateOfBirth: '2013-12-14',
		bloodGroup: 'A+',
		guardianFirst: 'Waqar',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Hassan',
		lastName: 'Qureshi',
		gender: 'male',
		dateOfBirth: '2013-06-21',
		bloodGroup: 'O+',
		guardianFirst: 'Shahid',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Zara',
		lastName: 'Siddiqui',
		gender: 'female',
		dateOfBirth: '2014-02-17',
		bloodGroup: 'B+',
		guardianFirst: 'Adeel',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Bilal',
		lastName: 'Hashmi',
		gender: 'male',
		dateOfBirth: '2013-10-05',
		bloodGroup: 'AB+',
		guardianFirst: 'Junaid',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Sana',
		lastName: 'Mirza',
		gender: 'female',
		dateOfBirth: '2014-04-28',
		bloodGroup: 'O+',
		guardianFirst: 'Farhan',
		guardianRelationship: 'father',
	},
	{
		firstName: 'Usman',
		lastName: 'Baig',
		gender: 'male',
		dateOfBirth: '2013-08-11',
		bloodGroup: 'A+',
		guardianFirst: 'Rizwan',
		guardianRelationship: 'father',
	},
];

const ADMITTED_ON = '2024-08-15';

const TEACHER_DEFS = [
	{
		email: 'seed.teacher.1@northwood.demo',
		username: 'seed_teacher_1',
		firstName: 'Ayesha',
		lastName: 'Khan',
		employeeCode: 'TCH-0001',
		phone: '+92 3001000001',
		qualification: 'M.Ed',
		specialization: 'Primary homeroom',
	},
	{
		email: 'seed.teacher.2@northwood.demo',
		username: 'seed_teacher_2',
		firstName: 'Bilal',
		lastName: 'Ahmed',
		employeeCode: 'TCH-0002',
		phone: '+92 3001000002',
		qualification: 'M.Sc Education',
		specialization: 'Science laboratory',
	},
] as const;

const DEMO_ACCOUNTS: Array<{
	email: string;
	username: string;
	role: MembershipRecord['role'];
}> = [
	{ email: 'seed.principal@northwood.demo', username: 'seed_principal', role: 'principal' },
	{
		email: 'seed.vice-principal@northwood.demo',
		username: 'seed_vice_principal',
		role: 'vice_principal',
	},
	{ email: 'seed.admin@northwood.demo', username: 'seed_admin', role: 'admin' },
	{ email: 'seed.parent@northwood.demo', username: 'seed_parent', role: 'parent' },
	{ email: 'seed.student@northwood.demo', username: 'seed_student', role: 'student' },
];

/** Fixed assessment scores (out of 20), one per Grade 5-A student in order. */
const ASSESSMENT_SCORES = [18, 15, 20, 12, 17, 19];
const ASSESSMENT_MAX_SCORE = 20;

/** Fixed homework marks (out of 10) for the first four Grade 5-A students. */
const HOMEWORK_TOTAL_MARKS = 10;
const HOMEWORK_GRADED_MARKS = [8, 9, 7, 10];

type Db = ReturnType<typeof drizzle<typeof schema>>;

type CampusRow = typeof schema.campuses.$inferSelect;
type ClassRow = typeof schema.classes.$inferSelect;
type SectionRow = typeof schema.sections.$inferSelect;
type SubjectRow = typeof schema.subjects.$inferSelect;
type StudentRow = typeof schema.students.$inferSelect;

type SeededStudent = {
	def: StudentDef;
	student: StudentRow;
	guardianId: string;
};

type SeededSection = {
	name: string;
	section: SectionRow;
	students: SeededStudent[];
	teacherMembershipId: string;
};

async function main(): Promise<void> {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error(
			'DATABASE_URL is required. Copy apps/nest-api/.env.example and set DATABASE_URL.',
		);
	}

	const tenantId = process.env.SEED_TENANT_ID?.trim();

	const client = postgres(databaseUrl, { max: 1, prepare: false });
	const db = drizzle(client, { schema });

	try {
		const tenant = await resolveTenant(db, tenantId);
		console.log(`QA seed for tenant: ${tenant.name} (${tenant.id})`);

		console.log('Wiping previous demo data…');
		await clearQaData(db, tenant.id);

		await ensureTenantConfig(db, tenant.id, tenant.name);

		const campus = await ensureCampus(db, tenant.id);
		const academicYear = await ensureAcademicYear(db, tenant.id);
		const grade5 = await ensureClass(db, tenant.id, 'Grade 5', 1);
		const grade6 = await ensureClass(db, tenant.id, 'Grade 6', 2);
		const subjects = await ensureSubjects(db, tenant.id);

		const teachers = await seedTeachers(db, tenant.id, campus);
		const teacher1 = teachers[0];
		const teacher2 = teachers[1];
		if (!teacher1 || !teacher2) throw new Error('Failed to seed teachers');

		const section5a = await ensureSection(
			db,
			tenant.id,
			campus,
			grade5,
			academicYear.id,
			SECTION_5A,
		);
		const section6a = await ensureSection(
			db,
			tenant.id,
			campus,
			grade6,
			academicYear.id,
			SECTION_6A,
		);

		await setHomeroom(db, section5a.id, teacher1.membershipId);
		await setHomeroom(db, section6a.id, teacher2.membershipId);

		const sectionSubjects5a = await seedSectionSubjects(
			db,
			tenant.id,
			section5a,
			subjects,
			teacher1,
			['ENG', 'MTH'],
		);
		await seedSectionSubjects(db, tenant.id, section6a, subjects, teacher2, ['SCI', 'URD']);

		const students5a = await seedStudentsForSection(
			db,
			tenant.id,
			campus,
			section5a,
			academicYear.id,
			STUDENTS_5A,
			1,
		);
		const students6a = await seedStudentsForSection(
			db,
			tenant.id,
			campus,
			section6a,
			academicYear.id,
			STUDENTS_6A,
			7,
		);

		const seeded5a: SeededSection = {
			name: SECTION_5A,
			section: section5a,
			students: students5a,
			teacherMembershipId: teacher1.membershipId,
		};
		const seeded6a: SeededSection = {
			name: SECTION_6A,
			section: section6a,
			students: students6a,
			teacherMembershipId: teacher2.membershipId,
		};

		const attendanceDates = recentWeekdays(3);
		await seedAttendance(db, tenant.id, campus, seeded5a, attendanceDates);
		await seedAttendance(db, tenant.id, campus, seeded6a, attendanceDates);

		const eng5a = sectionSubjects5a.get('ENG');
		if (!eng5a) throw new Error('Missing Grade 5-A ENG section subject');

		await seedHomework(db, tenant.id, eng5a, students5a, teacher1.membershipId);
		const assessmentId = await seedAssessment(
			db,
			tenant.id,
			eng5a,
			students5a,
			teacher1.membershipId,
		);
		await seedGradebook(
			db,
			tenant.id,
			section5a,
			academicYear.id,
			subjects,
			students5a,
			teacher1.membershipId,
			assessmentId,
		);

		const credentials = await seedDemoLogins(db, tenant.id, campus, students5a);

		printSummary({
			tenantName: tenant.name,
			tenantId: tenant.id,
			sections: [seeded5a, seeded6a],
			subjectCount: subjects.length,
			teacherCount: 2,
			attendanceDates,
			credentials,
		});
	} finally {
		await client.end();
	}
}

async function resolveTenant(db: Db, tenantId?: string) {
	if (tenantId) {
		const [tenant] = await db
			.select()
			.from(schema.tenants)
			.where(eq(schema.tenants.id, tenantId))
			.limit(1);
		if (!tenant) throw new Error(`Tenant not found: ${tenantId}`);
		return tenant;
	}

	const [tenant] = await db
		.select()
		.from(schema.tenants)
		.where(eq(schema.tenants.status, 'active'))
		.orderBy(schema.tenants.createdAt)
		.limit(1);

	if (!tenant) {
		throw new Error(
			'No active tenant found. Create an organization in the app first, or set SEED_TENANT_ID.',
		);
	}

	return tenant;
}

async function clearQaData(db: Db, tenantId: string): Promise<void> {
	// Child tables first (respect FK order), all scoped to the tenant's demo data.
	await db.delete(schema.attendanceMarks).where(eq(schema.attendanceMarks.tenantId, tenantId));
	await db
		.delete(schema.attendanceSessions)
		.where(eq(schema.attendanceSessions.tenantId, tenantId));
	await db.delete(schema.assessmentResults).where(eq(schema.assessmentResults.tenantId, tenantId));
	await db
		.delete(schema.assessmentRecipients)
		.where(eq(schema.assessmentRecipients.tenantId, tenantId));
	await db.delete(schema.assessments).where(eq(schema.assessments.tenantId, tenantId));
	await db
		.delete(schema.homeworkSubmissions)
		.where(eq(schema.homeworkSubmissions.tenantId, tenantId));
	await db
		.delete(schema.homeworkRecipients)
		.where(eq(schema.homeworkRecipients.tenantId, tenantId));
	await db
		.delete(schema.homeworkAssignments)
		.where(eq(schema.homeworkAssignments.tenantId, tenantId));
	await db.delete(schema.gradebookEntries).where(eq(schema.gradebookEntries.tenantId, tenantId));
	await db.delete(schema.enrollments).where(eq(schema.enrollments.tenantId, tenantId));
	await db.delete(schema.studentGuardians).where(eq(schema.studentGuardians.tenantId, tenantId));
	await db.delete(schema.guardians).where(eq(schema.guardians.tenantId, tenantId));

	const seedStudents = await db
		.select({ id: schema.students.id })
		.from(schema.students)
		.where(
			and(
				eq(schema.students.tenantId, tenantId),
				like(schema.students.studentCode, `${SEED_STUDENT_CODE_PREFIX}%`),
			),
		);
	const studentIds = seedStudents.map((row) => row.id);
	if (studentIds.length > 0) {
		await db.delete(schema.students).where(inArray(schema.students.id, studentIds));
	}

	await db.delete(schema.sectionSubjects).where(eq(schema.sectionSubjects.tenantId, tenantId));
	await db.delete(schema.timetableEntries).where(eq(schema.timetableEntries.tenantId, tenantId));
	await db.delete(schema.timetablePeriods).where(eq(schema.timetablePeriods.tenantId, tenantId));

	// Reset section homeroom refs before removing teacher memberships.
	await db
		.update(schema.sections)
		.set({ homeroomTeacherMembershipId: null, updatedAt: new Date() })
		.where(eq(schema.sections.tenantId, tenantId));

	// Remove seed accounts (teachers + demo role logins) and their memberships.
	const seedUsers = await db
		.select({ id: schema.users.id })
		.from(schema.users)
		.where(like(schema.users.email, 'seed.%@northwood.demo'));

	for (const user of seedUsers) {
		const memberships = await db
			.select({ id: schema.memberships.id })
			.from(schema.memberships)
			.where(
				and(eq(schema.memberships.tenantId, tenantId), eq(schema.memberships.userId, user.id)),
			);
		const membershipIds = memberships.map((row) => row.id);

		if (membershipIds.length > 0) {
			await db
				.delete(schema.staffProfiles)
				.where(inArray(schema.staffProfiles.membershipId, membershipIds));
			await db
				.delete(schema.membershipRoles)
				.where(inArray(schema.membershipRoles.membershipId, membershipIds));
			await db.delete(schema.memberships).where(inArray(schema.memberships.id, membershipIds));
		}

		await db.delete(schema.users).where(eq(schema.users.id, user.id));
	}
}

async function ensureTenantConfig(db: Db, tenantId: string, tenantName: string): Promise<void> {
	await db.insert(schema.tenantSettings).values({ tenantId }).onConflictDoNothing();
	await db
		.insert(schema.tenantBranding)
		.values({ tenantId, displayNameEn: tenantName })
		.onConflictDoNothing();
	await db.insert(schema.tenantCommunicationPolicies).values({ tenantId }).onConflictDoNothing();
}

async function ensureCampus(db: Db, tenantId: string): Promise<CampusRow> {
	const [existing] = await db
		.select()
		.from(schema.campuses)
		.where(and(eq(schema.campuses.tenantId, tenantId), eq(schema.campuses.code, CAMPUS_CODE)))
		.limit(1);

	if (existing) return existing;

	const [created] = await db
		.insert(schema.campuses)
		.values({
			tenantId,
			name: CAMPUS_NAME,
			code: CAMPUS_CODE,
			address: CAMPUS_ADDRESS,
			geoLat: CAMPUS_LAT,
			geoLng: CAMPUS_LNG,
			status: 'active',
		})
		.returning();

	if (!created) throw new Error('Could not create campus');
	return created;
}

async function ensureAcademicYear(db: Db, tenantId: string) {
	const [existingActive] = await db
		.select()
		.from(schema.academicYears)
		.where(
			and(eq(schema.academicYears.tenantId, tenantId), eq(schema.academicYears.status, 'active')),
		)
		.limit(1);

	if (existingActive) return existingActive;

	const now = new Date();
	const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
	const name = `${year}-${year + 1}`;

	const [created] = await db
		.insert(schema.academicYears)
		.values({
			tenantId,
			name,
			startsOn: `${year}-08-01`,
			endsOn: `${year + 1}-06-30`,
			status: 'active',
		})
		.onConflictDoNothing({ target: [schema.academicYears.tenantId, schema.academicYears.name] })
		.returning();

	if (created) return created;

	const [fallback] = await db
		.select()
		.from(schema.academicYears)
		.where(eq(schema.academicYears.tenantId, tenantId))
		.limit(1);

	if (!fallback) throw new Error('Could not create academic year');
	return fallback;
}

async function ensureClass(
	db: Db,
	tenantId: string,
	name: string,
	sortOrder: number,
): Promise<ClassRow> {
	const [existing] = await db
		.select()
		.from(schema.classes)
		.where(and(eq(schema.classes.tenantId, tenantId), eq(schema.classes.name, name)))
		.limit(1);

	if (existing) return existing;

	const [created] = await db
		.insert(schema.classes)
		.values({ tenantId, name, sortOrder })
		.onConflictDoNothing({ target: [schema.classes.tenantId, schema.classes.name] })
		.returning();

	if (created) return created;

	const [fallback] = await db
		.select()
		.from(schema.classes)
		.where(and(eq(schema.classes.tenantId, tenantId), eq(schema.classes.name, name)))
		.limit(1);

	if (!fallback) throw new Error(`Could not create class: ${name}`);
	return fallback;
}

async function ensureSection(
	db: Db,
	tenantId: string,
	campus: CampusRow,
	schoolClass: ClassRow,
	academicYearId: string,
	name: string,
): Promise<SectionRow> {
	const [existing] = await db
		.select()
		.from(schema.sections)
		.where(
			and(
				eq(schema.sections.tenantId, tenantId),
				eq(schema.sections.academicYearId, academicYearId),
				eq(schema.sections.campusId, campus.id),
				eq(schema.sections.classId, schoolClass.id),
				eq(schema.sections.name, name),
			),
		)
		.limit(1);

	if (existing) return existing;

	const [created] = await db
		.insert(schema.sections)
		.values({
			tenantId,
			campusId: campus.id,
			classId: schoolClass.id,
			academicYearId,
			name,
			status: 'active',
		})
		.returning();

	if (!created) throw new Error(`Could not create section: ${name}`);
	return created;
}

async function ensureSubjects(db: Db, tenantId: string): Promise<SubjectRow[]> {
	const existing = await db
		.select()
		.from(schema.subjects)
		.where(eq(schema.subjects.tenantId, tenantId));

	const byCode = new Map(existing.map((subject) => [subject.code, subject]));

	for (const def of SUBJECT_DEFS) {
		if (byCode.has(def.code)) continue;
		const [created] = await db
			.insert(schema.subjects)
			.values({
				tenantId,
				code: def.code,
				name: def.name,
				description: def.description,
			})
			.onConflictDoNothing({ target: [schema.subjects.tenantId, schema.subjects.code] })
			.returning();
		if (created) byCode.set(created.code, created);
	}

	const result: SubjectRow[] = [];
	for (const def of SUBJECT_DEFS) {
		const subject = byCode.get(def.code);
		if (!subject) throw new Error(`Could not resolve subject: ${def.code}`);
		result.push(subject);
	}
	return result;
}

type TeacherSeed = {
	membershipId: string;
	firstName: string;
	lastName: string;
};

async function seedTeachers(db: Db, tenantId: string, campus: CampusRow): Promise<TeacherSeed[]> {
	const passwordHash = await hash(TEACHER_PASSWORD, BCRYPT_ROUNDS);
	const teachers: TeacherSeed[] = [];

	for (const def of TEACHER_DEFS) {
		const [user] = await db
			.insert(schema.users)
			.values({
				email: def.email,
				username: def.username,
				passwordHash,
				emailVerifiedAt: new Date(),
				isActive: true,
			})
			.onConflictDoNothing({ target: schema.users.email })
			.returning();

		const resolvedUser =
			user ??
			(await db.select().from(schema.users).where(eq(schema.users.email, def.email)).limit(1))[0];

		if (!resolvedUser) throw new Error(`Failed to resolve teacher user: ${def.email}`);

		const [membership] = await db
			.insert(schema.memberships)
			.values({
				tenantId,
				userId: resolvedUser.id,
				campusId: campus.id,
				role: 'teacher',
				status: 'active',
			})
			.onConflictDoNothing({ target: [schema.memberships.tenantId, schema.memberships.userId] })
			.returning();

		const resolvedMembership =
			membership ??
			(
				await db
					.select()
					.from(schema.memberships)
					.where(
						and(
							eq(schema.memberships.tenantId, tenantId),
							eq(schema.memberships.userId, resolvedUser.id),
						),
					)
					.limit(1)
			)[0];

		if (!resolvedMembership) throw new Error(`Failed to resolve teacher membership: ${def.email}`);

		await db
			.insert(schema.membershipRoles)
			.values({ membershipId: resolvedMembership.id, role: 'teacher' })
			.onConflictDoNothing({
				target: [schema.membershipRoles.membershipId, schema.membershipRoles.role],
			});

		await db
			.insert(schema.staffProfiles)
			.values({
				tenantId,
				membershipId: resolvedMembership.id,
				employeeCode: def.employeeCode,
				phone: def.phone,
				qualification: def.qualification,
				specialization: def.specialization,
				hireDate: '2022-03-01',
				status: 'active',
			})
			.onConflictDoNothing({ target: schema.staffProfiles.membershipId });

		teachers.push({
			membershipId: resolvedMembership.id,
			firstName: def.firstName,
			lastName: def.lastName,
		});
	}

	return teachers;
}

async function setHomeroom(db: Db, sectionId: string, membershipId: string): Promise<void> {
	await db
		.update(schema.sections)
		.set({ homeroomTeacherMembershipId: membershipId, updatedAt: new Date() })
		.where(eq(schema.sections.id, sectionId));
}

async function seedSectionSubjects(
	db: Db,
	tenantId: string,
	section: SectionRow,
	subjects: SubjectRow[],
	teacher: TeacherSeed,
	subjectCodes: string[],
): Promise<Map<string, string>> {
	const result = new Map<string, string>();

	for (const code of subjectCodes) {
		const subject = subjects.find((row) => row.code === code);
		if (!subject) throw new Error(`Subject not found: ${code}`);

		const [inserted] = await db
			.insert(schema.sectionSubjects)
			.values({
				tenantId,
				sectionId: section.id,
				subjectId: subject.id,
				teacherMembershipId: teacher.membershipId,
			})
			.onConflictDoNothing({
				target: [schema.sectionSubjects.sectionId, schema.sectionSubjects.subjectId],
			})
			.returning();

		const resolved =
			inserted ??
			(
				await db
					.select()
					.from(schema.sectionSubjects)
					.where(
						and(
							eq(schema.sectionSubjects.sectionId, section.id),
							eq(schema.sectionSubjects.subjectId, subject.id),
						),
					)
					.limit(1)
			)[0];

		if (!resolved) throw new Error(`Could not resolve section subject: ${section.name} ${code}`);
		result.set(code, resolved.id);
	}

	return result;
}

async function seedStudentsForSection(
	db: Db,
	tenantId: string,
	campus: CampusRow,
	section: SectionRow,
	academicYearId: string,
	defs: StudentDef[],
	codeStart: number,
): Promise<SeededStudent[]> {
	const seeded: SeededStudent[] = [];

	for (let index = 0; index < defs.length; index += 1) {
		const def = defs[index];
		if (!def) continue;

		const sequence = codeStart + index;
		const studentCode = `${SEED_STUDENT_CODE_PREFIX}${CAMPUS_CODE}-25${String(sequence).padStart(4, '0')}`;
		const email = `${def.firstName.toLowerCase()}.${def.lastName.toLowerCase()}@student.northwood.demo`;
		const phone = `+92 30${String(1000000 + sequence)}`;

		const [student] = await db
			.insert(schema.students)
			.values({
				tenantId,
				campusId: campus.id,
				studentCode,
				firstName: def.firstName,
				lastName: def.lastName,
				dateOfBirth: def.dateOfBirth,
				gender: def.gender,
				email,
				phone,
				addressLine1: `House ${sequence}, Street 4, Gulshan-e-Iqbal`,
				city: 'Karachi',
				state: 'Sindh',
				postalCode: '75500',
				country: 'Pakistan',
				bloodGroup: def.bloodGroup,
				emergencyContactName: `${def.guardianFirst} ${def.lastName}`,
				emergencyContactPhone: phone,
				admittedOn: ADMITTED_ON,
				status: 'active',
			})
			.returning();

		if (!student) throw new Error(`Failed to create student: ${studentCode}`);

		const guardianEmail = `${def.guardianFirst.toLowerCase()}.${def.lastName.toLowerCase()}@family.northwood.demo`;
		const [guardian] = await db
			.insert(schema.guardians)
			.values({
				tenantId,
				firstName: def.guardianFirst,
				lastName: def.lastName,
				email: guardianEmail,
				phone,
				city: 'Karachi',
				state: 'Sindh',
				postalCode: '75500',
				country: 'Pakistan',
				occupation: 'Business owner',
				preferredChannel: 'whatsapp',
			})
			.returning();

		if (!guardian) throw new Error(`Failed to create guardian for: ${studentCode}`);

		await db.insert(schema.studentGuardians).values({
			tenantId,
			studentId: student.id,
			guardianId: guardian.id,
			relationship: def.guardianRelationship,
			isPrimary: true,
			canPickup: true,
			receivesNotifications: true,
		});

		await db.insert(schema.enrollments).values({
			tenantId,
			studentId: student.id,
			sectionId: section.id,
			academicYearId,
			status: 'active',
			enrolledOn: ADMITTED_ON,
		});

		seeded.push({ def, student, guardianId: guardian.id });
	}

	return seeded;
}

function recentWeekdays(count: number): string[] {
	const today = new Date();
	const dates: string[] = [];

	for (let offset = 1; offset <= 14 && dates.length < count; offset += 1) {
		const day = new Date(today);
		day.setDate(today.getDate() - offset);
		const weekday = day.getDay();
		if (weekday === 0 || weekday === 6) continue;
		dates.push(formatDate(day));
	}

	return dates;
}

function formatDate(value: Date): string {
	return value.toISOString().slice(0, 10);
}

async function seedAttendance(
	db: Db,
	tenantId: string,
	campus: CampusRow,
	section: SeededSection,
	dates: string[],
): Promise<void> {
	for (let dateIndex = 0; dateIndex < dates.length; dateIndex += 1) {
		const sessionDate = dates[dateIndex];
		if (!sessionDate) continue;

		const [session] = await db
			.insert(schema.attendanceSessions)
			.values({
				tenantId,
				campusId: campus.id,
				sectionId: section.section.id,
				sessionType: 'class',
				sessionDate,
			})
			.returning();

		if (!session) throw new Error(`Failed to create attendance session: ${sessionDate}`);

		// Rotate the single absent student per session so the pattern is verifiable.
		const absentIndex = dateIndex % section.students.length;

		const marks = section.students.map((entry, studentIndex) => ({
			tenantId,
			sessionId: session.id,
			studentId: entry.student.id,
			status: (studentIndex === absentIndex ? 'absent' : 'present') as 'present' | 'absent',
			markedAt: new Date(`${sessionDate}T08:30:00+05:00`),
			markedByMembershipId: section.teacherMembershipId,
		}));

		await db.insert(schema.attendanceMarks).values(marks);
	}
}

async function seedHomework(
	db: Db,
	tenantId: string,
	sectionSubjectId: string,
	students: SeededStudent[],
	teacherMembershipId: string,
): Promise<void> {
	const dueAt = new Date();
	dueAt.setDate(dueAt.getDate() + 5);
	dueAt.setHours(23, 59, 0, 0);

	const [homework] = await db
		.insert(schema.homeworkAssignments)
		.values({
			tenantId,
			sectionSubjectId,
			title: 'Essay: My School',
			description: 'Write a 300-word essay describing your school and what you enjoy most.',
			dueAt,
			status: 'published',
			assignMode: 'whole_class',
			estimatedMinutes: 45,
			createdByMembershipId: teacherMembershipId,
		})
		.returning();

	if (!homework) throw new Error('Failed to create homework assignment');

	await db.insert(schema.homeworkRecipients).values(
		students.map((entry) => ({
			tenantId,
			homeworkId: homework.id,
			studentId: entry.student.id,
		})),
	);

	const submittedAt = new Date();
	submittedAt.setDate(submittedAt.getDate() - 1);

	const submissions: (typeof schema.homeworkSubmissions.$inferInsert)[] = students.map(
		(entry, index) => {
			const base = {
				tenantId,
				homeworkId: homework.id,
				studentId: entry.student.id,
			};

			const gradedMarks = HOMEWORK_GRADED_MARKS[index];
			if (index < HOMEWORK_GRADED_MARKS.length && gradedMarks !== undefined) {
				const percentage = (gradedMarks / HOMEWORK_TOTAL_MARKS) * 100;
				return {
					...base,
					status: 'graded' as const,
					submittedAt,
					grade: gradeFromPercentage(percentage),
					marksObtained: String(gradedMarks),
					totalMarks: String(HOMEWORK_TOTAL_MARKS),
					feedback: 'Good effort.',
					gradedBy: teacherMembershipId,
					gradedAt: new Date(),
				};
			}

			// Fifth student: submitted, awaiting grade. Sixth: not yet submitted.
			if (index === HOMEWORK_GRADED_MARKS.length) {
				return { ...base, status: 'submitted' as const, submittedAt };
			}
			return { ...base, status: 'pending' as const };
		},
	);

	await db.insert(schema.homeworkSubmissions).values(submissions);
}

async function seedAssessment(
	db: Db,
	tenantId: string,
	sectionSubjectId: string,
	students: SeededStudent[],
	teacherMembershipId: string,
): Promise<string> {
	const assessedOn = recentWeekdays(1)[0] ?? formatDate(new Date());

	const [assessment] = await db
		.insert(schema.assessments)
		.values({
			tenantId,
			sectionSubjectId,
			type: 'test',
			title: 'English Quiz 1',
			assessedOn,
			maxScore: String(ASSESSMENT_MAX_SCORE),
			status: 'published',
			assignMode: 'whole_class',
			durationMinutes: 40,
			instructions: 'Answer all questions. Read each passage carefully.',
			createdByMembershipId: teacherMembershipId,
		})
		.returning();

	if (!assessment) throw new Error('Failed to create assessment');

	await db.insert(schema.assessmentRecipients).values(
		students.map((entry) => ({
			tenantId,
			assessmentId: assessment.id,
			studentId: entry.student.id,
		})),
	);

	await db.insert(schema.assessmentResults).values(
		students.map((entry, index) => ({
			tenantId,
			assessmentId: assessment.id,
			studentId: entry.student.id,
			score: String(ASSESSMENT_SCORES[index] ?? 0),
			status: 'graded' as const,
		})),
	);

	return assessment.id;
}

async function seedGradebook(
	db: Db,
	tenantId: string,
	section: SectionRow,
	academicYearId: string,
	subjects: SubjectRow[],
	students: SeededStudent[],
	teacherMembershipId: string,
	assessmentId: string,
): Promise<void> {
	const eng = subjects.find((row) => row.code === 'ENG');
	if (!eng) throw new Error('Subject not found: ENG');

	await db.insert(schema.gradebookEntries).values(
		students.map((entry, index) => {
			const obtained = ASSESSMENT_SCORES[index] ?? 0;
			const percentage = (obtained / ASSESSMENT_MAX_SCORE) * 100;
			return {
				tenantId,
				studentId: entry.student.id,
				sectionId: section.id,
				academicYearId,
				term: 'term1' as const,
				subjectId: eng.id,
				totalMarks: String(ASSESSMENT_MAX_SCORE),
				obtainedMarks: String(obtained),
				grade: gradeFromPercentage(percentage),
				gradePoint: String(gradePointFromPercentage(percentage)),
				source: 'assessment' as const,
				sourceId: assessmentId,
				createdByMembershipId: teacherMembershipId,
			};
		}),
	);
}

type Credential = { role: string; email: string; password: string };

async function seedDemoLogins(
	db: Db,
	tenantId: string,
	campus: CampusRow,
	students5a: SeededStudent[],
): Promise<Credential[]> {
	const passwordHash = await hash(DEMO_ROLE_PASSWORD, BCRYPT_ROUNDS);
	const credentials: Credential[] = [];

	const ownerEmail = await resetOwnerPassword(db, tenantId, passwordHash);
	if (ownerEmail) {
		credentials.push({ role: 'owner', email: ownerEmail, password: DEMO_ROLE_PASSWORD });
	}

	const ahmed = students5a[0];

	for (const account of DEMO_ACCOUNTS) {
		const user = await ensureUser(db, account.email, account.username, passwordHash);
		const membership = await ensureMembership(db, tenantId, user.id, campus.id, account.role);

		if (account.role === 'parent' && ahmed) {
			await linkParentGuardian(db, ahmed.guardianId, membership.id);
		}
		if (account.role === 'student' && ahmed) {
			await linkStudentRecord(db, ahmed.student.id, campus.id, membership.id);
		}

		credentials.push({ role: account.role, email: account.email, password: DEMO_ROLE_PASSWORD });
	}

	credentials.push({
		role: 'teacher',
		email: TEACHER_DEFS[0]?.email ?? 'seed.teacher.1@northwood.demo',
		password: TEACHER_PASSWORD,
	});
	credentials.push({
		role: 'teacher',
		email: TEACHER_DEFS[1]?.email ?? 'seed.teacher.2@northwood.demo',
		password: TEACHER_PASSWORD,
	});

	return credentials;
}

async function ensureUser(db: Db, email: string, username: string, passwordHash: string) {
	const [inserted] = await db
		.insert(schema.users)
		.values({
			email,
			username,
			passwordHash,
			emailVerifiedAt: new Date(),
			isActive: true,
		})
		.onConflictDoUpdate({
			target: schema.users.email,
			set: { passwordHash, isActive: true, emailVerifiedAt: new Date(), updatedAt: new Date() },
		})
		.returning();

	if (inserted) return inserted;

	const [existing] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, email))
		.limit(1);
	if (!existing) throw new Error(`Failed to resolve user: ${email}`);
	await db
		.update(schema.users)
		.set({ passwordHash, isActive: true, emailVerifiedAt: new Date(), updatedAt: new Date() })
		.where(eq(schema.users.id, existing.id));
	return existing;
}

async function ensureMembership(
	db: Db,
	tenantId: string,
	userId: string,
	campusId: string | null,
	role: MembershipRecord['role'],
) {
	const [inserted] = await db
		.insert(schema.memberships)
		.values({
			tenantId,
			userId,
			campusId,
			role,
			status: 'active',
		})
		.onConflictDoUpdate({
			target: [schema.memberships.tenantId, schema.memberships.userId],
			set: { role, campusId, status: 'active', updatedAt: new Date() },
		})
		.returning();

	const membership =
		inserted ??
		(
			await db
				.select()
				.from(schema.memberships)
				.where(
					and(eq(schema.memberships.tenantId, tenantId), eq(schema.memberships.userId, userId)),
				)
				.limit(1)
		)[0];

	if (!membership) throw new Error(`Failed to resolve membership for role ${role}`);

	await db
		.insert(schema.membershipRoles)
		.values({ membershipId: membership.id, role })
		.onConflictDoNothing({
			target: [schema.membershipRoles.membershipId, schema.membershipRoles.role],
		});

	return membership;
}

async function resetOwnerPassword(
	db: Db,
	tenantId: string,
	passwordHash: string,
): Promise<string | null> {
	const [ownerRow] = await db
		.select({ userId: schema.memberships.userId, email: schema.users.email })
		.from(schema.memberships)
		.innerJoin(schema.users, eq(schema.users.id, schema.memberships.userId))
		.where(and(eq(schema.memberships.tenantId, tenantId), eq(schema.memberships.role, 'owner')))
		.limit(1);

	if (!ownerRow) {
		console.warn('No owner membership on tenant — skip owner password reset.');
		return null;
	}

	await db
		.update(schema.users)
		.set({ passwordHash, isActive: true, emailVerifiedAt: new Date(), updatedAt: new Date() })
		.where(eq(schema.users.id, ownerRow.userId));

	return ownerRow.email;
}

async function linkParentGuardian(db: Db, guardianId: string, membershipId: string): Promise<void> {
	await db
		.update(schema.guardians)
		.set({ membershipId, email: 'seed.parent@northwood.demo', updatedAt: new Date() })
		.where(eq(schema.guardians.id, guardianId));
}

async function linkStudentRecord(
	db: Db,
	studentId: string,
	campusId: string,
	membershipId: string,
): Promise<void> {
	await db
		.update(schema.students)
		.set({ membershipId, email: 'seed.student@northwood.demo', updatedAt: new Date() })
		.where(eq(schema.students.id, studentId));

	await db
		.update(schema.memberships)
		.set({ campusId, updatedAt: new Date() })
		.where(eq(schema.memberships.id, membershipId));
}

function printSummary(input: {
	tenantName: string;
	tenantId: string;
	sections: SeededSection[];
	subjectCount: number;
	teacherCount: number;
	attendanceDates: string[];
	credentials: Credential[];
}): void {
	const studentCount = input.sections.reduce((sum, section) => sum + section.students.length, 0);

	console.log('\nQA seed complete.');
	console.log(`  Tenant:        ${input.tenantName} (${input.tenantId})`);
	console.log('  Campuses:      1');
	console.log(`  Grades:        ${input.sections.length}`);
	console.log(`  Sections:      ${input.sections.length}`);
	console.log(`  Subjects:      ${input.subjectCount}`);
	console.log(`  Teachers:      ${input.teacherCount}`);
	console.log(`  Students:      ${studentCount}`);
	console.log(`  Guardians:     ${studentCount}`);
	console.log(
		`  Attendance:    ${input.attendanceDates.length} sessions/section (${input.attendanceDates.join(', ')})`,
	);
	console.log('  Homework:      1 (Grade 5-A ENG)');
	console.log('  Assessments:   1 (Grade 5-A ENG)');
	console.log('  Gradebook:     6 entries (Grade 5-A ENG, term1)');

	console.log('\nLogin credentials:');
	console.log('  role           | email                                  | password');
	console.log('  ---------------|----------------------------------------|---------------');
	for (const credential of input.credentials) {
		console.log(
			`  ${credential.role.padEnd(14)} | ${credential.email.padEnd(38)} | ${credential.password}`,
		);
	}

	console.log('\nWeb: http://localhost:3000');
}

void main().catch((error) => {
	console.error('QA seed failed:', error);
	process.exit(1);
});
