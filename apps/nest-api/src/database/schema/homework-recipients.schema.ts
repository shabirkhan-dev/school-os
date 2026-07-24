import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { homeworkAssignments } from './homework-assignments.schema';
import { students } from './students.schema';
import { tenants } from './tenants.schema';

export const homeworkRecipients = pgTable(
	'homework_recipients',
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
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		index('homework_recipients_tenant_id_idx').on(table.tenantId),
		index('homework_recipients_homework_id_idx').on(table.homeworkId),
	],
);

export type HomeworkRecipientRecord = typeof homeworkRecipients.$inferSelect;
