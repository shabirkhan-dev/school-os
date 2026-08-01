import {
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { homeworkAssignments } from './homework-assignments.schema';
import { memberships } from './memberships.schema';
import { students } from './students.schema';
import { tenants } from './tenants.schema';

export const homeworkSubmissionStatus = pgEnum('homework_submission_status', [
	'pending',
	'submitted',
	'late',
	'graded',
	'excused',
]);

export const homeworkSubmissions = pgTable(
	'homework_submissions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		homeworkId: uuid('homework_id')
			.notNull()
			.references(() => homeworkAssignments.id, { onDelete: 'cascade' }),
		studentId: uuid('student_id')
			.notNull()
			.references(() => students.id, { onDelete: 'cascade' }),
		status: homeworkSubmissionStatus('status').notNull().default('pending'),
		submittedAt: timestamp('submitted_at', { withTimezone: true }),
		grade: varchar('grade', { length: 16 }),
		marksObtained: numeric('marks_obtained', { precision: 8, scale: 2 }),
		totalMarks: numeric('total_marks', { precision: 8, scale: 2 }),
		feedback: text('feedback'),
		attachmentUrl: text('attachment_url'),
		gradedBy: uuid('graded_by').references(() => memberships.id, { onDelete: 'set null' }),
		gradedAt: timestamp('graded_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('homework_submissions_homework_student_unique').on(
			table.homeworkId,
			table.studentId,
		),
		index('homework_submissions_tenant_homework_idx').on(table.tenantId, table.homeworkId),
		index('homework_submissions_tenant_student_idx').on(table.tenantId, table.studentId),
		index('homework_submissions_status_idx').on(table.status),
	],
);

export type HomeworkSubmissionRecord = typeof homeworkSubmissions.$inferSelect;
