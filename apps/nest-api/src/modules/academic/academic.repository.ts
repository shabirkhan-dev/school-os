import { Injectable } from '@nestjs/common';
import { and, asc, eq, isNull, ne } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import { academicYears, classes, sections } from '@/database/schema';

@Injectable()
export class AcademicRepository {
	constructor(private readonly database: DatabaseService) {}

	async listAcademicYears(tenantId: string) {
		return this.database.db
			.select()
			.from(academicYears)
			.where(and(eq(academicYears.tenantId, tenantId), isNull(academicYears.deletedAt)))
			.orderBy(asc(academicYears.startsOn));
	}

	async findAcademicYearById(tenantId: string, academicYearId: string) {
		const [year] = await this.database.db
			.select()
			.from(academicYears)
			.where(
				and(
					eq(academicYears.id, academicYearId),
					eq(academicYears.tenantId, tenantId),
					isNull(academicYears.deletedAt),
				),
			)
			.limit(1);
		return year ?? null;
	}

	async findActiveAcademicYear(tenantId: string, excludeId?: string) {
		const conditions = [
			eq(academicYears.tenantId, tenantId),
			eq(academicYears.status, 'active'),
			isNull(academicYears.deletedAt),
		];
		if (excludeId) {
			conditions.push(ne(academicYears.id, excludeId));
		}

		const [year] = await this.database.db
			.select()
			.from(academicYears)
			.where(and(...conditions))
			.limit(1);
		return year ?? null;
	}

	async createAcademicYear(input: typeof academicYears.$inferInsert) {
		const [year] = await this.database.db.insert(academicYears).values(input).returning();
		if (!year) throw new Error('Academic year insert did not return a record');
		return year;
	}

	async updateAcademicYear(
		tenantId: string,
		academicYearId: string,
		input: Partial<typeof academicYears.$inferInsert>,
	) {
		const [year] = await this.database.db
			.update(academicYears)
			.set({ ...input, updatedAt: new Date() })
			.where(
				and(
					eq(academicYears.id, academicYearId),
					eq(academicYears.tenantId, tenantId),
					isNull(academicYears.deletedAt),
				),
			)
			.returning();
		return year ?? null;
	}

	async listClasses(tenantId: string) {
		return this.database.db
			.select()
			.from(classes)
			.where(and(eq(classes.tenantId, tenantId), isNull(classes.deletedAt)))
			.orderBy(asc(classes.sortOrder), asc(classes.name));
	}

	async findClassById(tenantId: string, classId: string) {
		const [classRecord] = await this.database.db
			.select()
			.from(classes)
			.where(
				and(eq(classes.id, classId), eq(classes.tenantId, tenantId), isNull(classes.deletedAt)),
			)
			.limit(1);
		return classRecord ?? null;
	}

	async findClassByName(tenantId: string, name: string) {
		const [classRecord] = await this.database.db
			.select()
			.from(classes)
			.where(and(eq(classes.tenantId, tenantId), eq(classes.name, name), isNull(classes.deletedAt)))
			.limit(1);
		return classRecord ?? null;
	}

	async createClass(input: typeof classes.$inferInsert) {
		const [classRecord] = await this.database.db.insert(classes).values(input).returning();
		if (!classRecord) throw new Error('Class insert did not return a record');
		return classRecord;
	}

	async updateClass(
		tenantId: string,
		classId: string,
		input: Partial<typeof classes.$inferInsert>,
	) {
		const [classRecord] = await this.database.db
			.update(classes)
			.set({ ...input, updatedAt: new Date() })
			.where(
				and(eq(classes.id, classId), eq(classes.tenantId, tenantId), isNull(classes.deletedAt)),
			)
			.returning();
		return classRecord ?? null;
	}

	async listSections(tenantId: string, filters?: { campusId?: string; academicYearId?: string }) {
		const conditions = [eq(sections.tenantId, tenantId), isNull(sections.deletedAt)];
		if (filters?.campusId) conditions.push(eq(sections.campusId, filters.campusId));
		if (filters?.academicYearId)
			conditions.push(eq(sections.academicYearId, filters.academicYearId));

		return this.database.db
			.select()
			.from(sections)
			.where(and(...conditions))
			.orderBy(asc(sections.name));
	}

	async findSectionById(tenantId: string, sectionId: string) {
		const [section] = await this.database.db
			.select()
			.from(sections)
			.where(
				and(
					eq(sections.id, sectionId),
					eq(sections.tenantId, tenantId),
					isNull(sections.deletedAt),
				),
			)
			.limit(1);
		return section ?? null;
	}

	async createSection(input: typeof sections.$inferInsert) {
		const [section] = await this.database.db.insert(sections).values(input).returning();
		if (!section) throw new Error('Section insert did not return a record');
		return section;
	}

	async updateSection(
		tenantId: string,
		sectionId: string,
		input: Partial<typeof sections.$inferInsert>,
	) {
		const [section] = await this.database.db
			.update(sections)
			.set({ ...input, updatedAt: new Date() })
			.where(
				and(
					eq(sections.id, sectionId),
					eq(sections.tenantId, tenantId),
					isNull(sections.deletedAt),
				),
			)
			.returning();
		return section ?? null;
	}
}
