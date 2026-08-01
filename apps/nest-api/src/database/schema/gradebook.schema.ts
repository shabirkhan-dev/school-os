import {
	index,
	numeric,
	pgEnum,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core';

import { academicYears } from './academic-years.schema';
import { sections } from './sections.schema';
import { students } from './students.schema';
import { subjects } from './subjects.schema';
import { tenants } from './tenants.schema';

export const gradebookTerm = pgEnum('gradebook_term', ['term1', 'term2', 'term3', 'final']);
export const gradebookSource = pgEnum('gradebook_source', ['assessment', 'homework', 'manual']);

export const gradebookEntries = pgTable(
	'gradebook_entries',
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
		term: gradebookTerm('term').notNull(),
		subjectId: uuid('subject_id')
			.notNull()
			.references(() => subjects.id, { onDelete: 'cascade' }),
		totalMarks: numeric('total_marks', { precision: 8, scale: 2 }).notNull().default('100'),
		obtainedMarks: numeric('obtained_marks', { precision: 8, scale: 2 }).notNull().default('0'),
		grade: varchar('grade', { length: 8 }).notNull().default('N'),
		gradePoint: numeric('grade_point', { precision: 4, scale: 2 }).notNull().default('0'),
		source: gradebookSource('source').notNull().default('manual'),
		sourceId: uuid('source_id'),
		createdByMembershipId: uuid('created_by_membership_id'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('gradebook_entries_tenant_id_idx').on(table.tenantId),
		index('gradebook_entries_tenant_student_idx').on(table.tenantId, table.studentId),
		index('gradebook_entries_tenant_section_year_term_idx').on(
			table.tenantId,
			table.sectionId,
			table.academicYearId,
			table.term,
		),
		index('gradebook_entries_source_idx').on(table.source, table.sourceId),
		uniqueIndex('gradebook_entries_student_section_term_subject_unique').on(
			table.studentId,
			table.sectionId,
			table.term,
			table.subjectId,
		),
	],
);

export type GradebookEntryRecord = typeof gradebookEntries.$inferSelect;
