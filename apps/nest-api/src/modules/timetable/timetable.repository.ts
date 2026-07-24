import { Injectable } from '@nestjs/common';
import { and, asc, count, eq } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { classes, sections, subjects, timetableEntries, timetablePeriods } from '@/database/schema';

@Injectable()
export class TimetableRepository {
	constructor(private readonly database: DatabaseService) {}

	async listPeriods(tenantId: string) {
		return this.database.db
			.select()
			.from(timetablePeriods)
			.where(eq(timetablePeriods.tenantId, tenantId))
			.orderBy(asc(timetablePeriods.sortOrder));
	}

	async listTeacherEntriesForDay(tenantId: string, teacherMembershipId: string, dayOfWeek: number) {
		return this.database.db
			.select({
				entry: timetableEntries,
				period: timetablePeriods,
				section: sections,
				subject: subjects,
				className: classes.name,
			})
			.from(timetableEntries)
			.innerJoin(timetablePeriods, eq(timetableEntries.periodId, timetablePeriods.id))
			.innerJoin(sections, eq(timetableEntries.sectionId, sections.id))
			.leftJoin(subjects, eq(timetableEntries.subjectId, subjects.id))
			.innerJoin(classes, eq(sections.classId, classes.id))
			.where(
				and(
					eq(timetableEntries.tenantId, tenantId),
					eq(timetableEntries.teacherMembershipId, teacherMembershipId),
					eq(timetableEntries.dayOfWeek, dayOfWeek),
				),
			)
			.orderBy(asc(timetablePeriods.sortOrder));
	}

	async countEntries(tenantId: string): Promise<number> {
		const [row] = await this.database.db
			.select({ count: count() })
			.from(timetableEntries)
			.where(eq(timetableEntries.tenantId, tenantId));
		return row?.count ?? 0;
	}

	async insertPeriods(values: (typeof timetablePeriods.$inferInsert)[]) {
		if (values.length === 0) return [];
		return this.database.db.insert(timetablePeriods).values(values).returning();
	}

	async insertEntries(values: (typeof timetableEntries.$inferInsert)[]) {
		if (values.length === 0) return [];
		return this.database.db.insert(timetableEntries).values(values).returning();
	}
}
