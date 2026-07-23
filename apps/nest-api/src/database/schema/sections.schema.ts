import { index, pgEnum, pgTable, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

import { academicYears } from './academic-years.schema';
import { campuses } from './campuses.schema';
import { classes } from './classes.schema';
import { memberships } from './memberships.schema';
import { tenants } from './tenants.schema';

export const sectionStatus = pgEnum('section_status', ['active', 'inactive']);

export const sections = pgTable(
	'sections',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		tenantId: uuid('tenant_id')
			.notNull()
			.references(() => tenants.id, { onDelete: 'cascade' }),
		campusId: uuid('campus_id')
			.notNull()
			.references(() => campuses.id, { onDelete: 'cascade' }),
		classId: uuid('class_id')
			.notNull()
			.references(() => classes.id, { onDelete: 'cascade' }),
		academicYearId: uuid('academic_year_id')
			.notNull()
			.references(() => academicYears.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 64 }).notNull(),
		homeroomTeacherMembershipId: uuid('homeroom_teacher_membership_id').references(
			() => memberships.id,
			{ onDelete: 'set null' },
		),
		status: sectionStatus('status').notNull().default('active'),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex('sections_tenant_year_campus_class_name_unique').on(
			table.tenantId,
			table.academicYearId,
			table.campusId,
			table.classId,
			table.name,
		),
		index('sections_tenant_id_idx').on(table.tenantId),
		index('sections_campus_id_idx').on(table.campusId),
		index('sections_academic_year_id_idx').on(table.academicYearId),
	],
);

export type SectionRecord = typeof sections.$inferSelect;
