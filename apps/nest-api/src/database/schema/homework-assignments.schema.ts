import {
	index,
	integer,
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
import { tenants } from './tenants.schema';

export const homeworkStatus = pgEnum('homework_status', ['draft', 'published', 'closed']);

export const homeworkAssignments = pgTable(
	'homework_assignments',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		sectionSubjectId: uuid('section_subject_id')
			.notNull()
			.references(() => sectionSubjects.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 200 }).notNull(),
		description: text('description'),
		dueAt: timestamp('due_at', { withTimezone: true }),
		status: homeworkStatus('status').notNull().default('draft'),
		assignMode: assignmentTargetMode('assign_mode').notNull().default('whole_class'),
		estimatedMinutes: integer('estimated_minutes'),
		materials: text('materials'),
		createdByMembershipId: uuid('created_by_membership_id')
			.notNull()
			.references(() => memberships.id, { onDelete: 'restrict' }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('homework_assignments_tenant_id_idx').on(table.tenantId),
		index('homework_assignments_section_subject_id_idx').on(table.sectionSubjectId),
		index('homework_assignments_due_at_idx').on(table.tenantId, table.dueAt),
	],
);

export type HomeworkAssignmentRecord = typeof homeworkAssignments.$inferSelect;
