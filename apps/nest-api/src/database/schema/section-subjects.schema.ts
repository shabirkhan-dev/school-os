import { index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { memberships } from './memberships.schema';
import { sections } from './sections.schema';
import { subjects } from './subjects.schema';
import { tenants } from './tenants.schema';

export const sectionSubjects = pgTable(
	'section_subjects',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		sectionId: uuid('section_id')
			.notNull()
			.references(() => sections.id, { onDelete: 'cascade' }),
		subjectId: uuid('subject_id')
			.notNull()
			.references(() => subjects.id, { onDelete: 'cascade' }),
		teacherMembershipId: uuid('teacher_membership_id').references(() => memberships.id, {
			onDelete: 'set null',
		}),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('section_subjects_section_subject_unique').on(table.sectionId, table.subjectId),
		index('section_subjects_tenant_id_idx').on(table.tenantId),
		index('section_subjects_teacher_membership_id_idx').on(table.teacherMembershipId),
	],
);

export type SectionSubjectRecord = typeof sectionSubjects.$inferSelect;
