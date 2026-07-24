import { date, index, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { academicYears } from './academic-years.schema';
import { sections } from './sections.schema';
import { students } from './students.schema';
import { tenants } from './tenants.schema';

export const enrollmentStatus = pgEnum('enrollment_status', ['active', 'transferred', 'withdrawn']);

export const enrollments = pgTable(
	'enrollments',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		studentId: uuid('student_id')
			.notNull()
			.references(() => students.id, { onDelete: 'cascade' }),
		sectionId: uuid('section_id')
			.notNull()
			.references(() => sections.id, { onDelete: 'cascade' }),
		academicYearId: uuid('academic_year_id')
			.notNull()
			.references(() => academicYears.id, { onDelete: 'cascade' }),
		status: enrollmentStatus('status').notNull().default('active'),
		enrolledOn: date('enrolled_on').notNull().defaultNow(),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('enrollments_tenant_id_idx').on(table.tenantId),
		index('enrollments_student_id_idx').on(table.studentId),
		index('enrollments_section_id_idx').on(table.sectionId),
		index('enrollments_academic_year_id_idx').on(table.academicYearId),
		index('enrollments_status_idx').on(table.status),
	],
);

export type EnrollmentRecord = typeof enrollments.$inferSelect;
