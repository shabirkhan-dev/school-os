import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { assessments } from './assessments.schema';
import { students } from './students.schema';
import { tenants } from './tenants.schema';

export const assessmentRecipients = pgTable(
	'assessment_recipients',
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
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('assessment_recipients_tenant_id_idx').on(table.tenantId),
		index('assessment_recipients_assessment_id_idx').on(table.assessmentId),
	],
);

export type AssessmentRecipientRecord = typeof assessmentRecipients.$inferSelect;
