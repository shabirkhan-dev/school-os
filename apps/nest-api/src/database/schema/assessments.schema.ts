import {
	date,
	index,
	integer,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { assignmentTargetMode } from './assignment-target-mode.schema';
import { memberships } from './memberships.schema';
import { sectionSubjects } from './section-subjects.schema';
import { students } from './students.schema';
import { tenants } from './tenants.schema';

export const assessmentType = pgEnum('assessment_type', ['quiz', 'test', 'exam']);
export const assessmentStatus = pgEnum('assessment_status', ['draft', 'published', 'closed']);
export const assessmentResultStatus = pgEnum('assessment_result_status', [
	'pending',
	'graded',
	'absent',
]);

export const assessments = pgTable(
	'assessments',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		sectionSubjectId: uuid('section_subject_id')
			.notNull()
			.references(() => sectionSubjects.id, { onDelete: 'cascade' }),
		type: assessmentType('type').notNull().default('test'),
		title: varchar('title', { length: 200 }).notNull(),
		assessedOn: date('assessed_on').notNull(),
		maxScore: numeric('max_score', { precision: 8, scale: 2 }).notNull().default('100'),
		status: assessmentStatus('status').notNull().default('draft'),
		assignMode: assignmentTargetMode('assign_mode').notNull().default('whole_class'),
		startsAt: timestamp('starts_at', { withTimezone: true }),
		durationMinutes: integer('duration_minutes'),
		room: varchar('room', { length: 120 }),
		instructions: text('instructions'),
		createdByMembershipId: uuid('created_by_membership_id')
			.notNull()
			.references(() => memberships.id, { onDelete: 'restrict' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('assessments_tenant_id_idx').on(table.tenantId),
		index('assessments_section_subject_id_idx').on(table.sectionSubjectId),
		index('assessments_assessed_on_idx').on(table.tenantId, table.assessedOn),
	],
);

export const assessmentResults = pgTable(
	'assessment_results',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		assessmentId: uuid('assessment_id')
			.notNull()
			.references(() => assessments.id, { onDelete: 'cascade' }),
		studentId: uuid('student_id')
			.notNull()
			.references(() => students.id, { onDelete: 'cascade' }),
		score: numeric('score', { precision: 8, scale: 2 }),
		status: assessmentResultStatus('status').notNull().default('pending'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('assessment_results_tenant_id_idx').on(table.tenantId),
		index('assessment_results_assessment_id_idx').on(table.assessmentId),
	],
);

export type AssessmentRecord = typeof assessments.$inferSelect;
export type AssessmentResultRecord = typeof assessmentResults.$inferSelect;
