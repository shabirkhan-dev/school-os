import { Injectable } from '@nestjs/common';
import { and, asc, eq, inArray, isNull, or } from 'drizzle-orm';

import { DatabaseService } from '@/database/database.service';
import {
	memberships,
	sectionSubjects,
	sections,
	staffProfiles,
	subjects,
	users,
} from '@/database/schema';

const teacherRoles = ['teacher', 'principal', 'admin', 'owner'] as const;

@Injectable()
export class StaffRepository {
	constructor(private readonly database: DatabaseService) {}

	async listTeachers(tenantId: string) {
		return this.database.db
			.select({
				membership: memberships,
				user: {
					id: users.id,
					email: users.email,
					username: users.username,
				},
				profile: staffProfiles,
			})
			.from(memberships)
			.innerJoin(users, eq(memberships.userId, users.id))
			.leftJoin(staffProfiles, eq(staffProfiles.membershipId, memberships.id))
			.where(
				and(
					eq(memberships.tenantId, tenantId),
					eq(memberships.status, 'active'),
					inArray(memberships.role, [...teacherRoles]),
					isNull(staffProfiles.deletedAt),
				),
			)
			.orderBy(asc(users.email));
	}

	async findProfileByMembershipId(tenantId: string, membershipId: string) {
		const [row] = await this.database.db
			.select()
			.from(staffProfiles)
			.where(
				and(
					eq(staffProfiles.tenantId, tenantId),
					eq(staffProfiles.membershipId, membershipId),
					isNull(staffProfiles.deletedAt),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findProfileById(tenantId: string, profileId: string) {
		const [row] = await this.database.db
			.select()
			.from(staffProfiles)
			.where(
				and(
					eq(staffProfiles.id, profileId),
					eq(staffProfiles.tenantId, tenantId),
					isNull(staffProfiles.deletedAt),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async upsertProfile(input: typeof staffProfiles.$inferInsert) {
		const existing = await this.findProfileByMembershipId(input.tenantId, input.membershipId);
		if (existing) {
			const [profile] = await this.database.db
				.update(staffProfiles)
				.set({ ...input, updatedAt: new Date() })
				.where(eq(staffProfiles.id, existing.id))
				.returning();
			return profile;
		}
		const [profile] = await this.database.db.insert(staffProfiles).values(input).returning();
		return profile;
	}

	async listHomeroomSections(tenantId: string, membershipId: string) {
		return this.database.db
			.select()
			.from(sections)
			.where(
				and(
					eq(sections.tenantId, tenantId),
					eq(sections.homeroomTeacherMembershipId, membershipId),
					isNull(sections.deletedAt),
				),
			);
	}

	async listSubjectAssignments(tenantId: string, membershipId: string) {
		return this.database.db
			.select({
				assignment: sectionSubjects,
				section: sections,
				subject: subjects,
			})
			.from(sectionSubjects)
			.innerJoin(sections, eq(sectionSubjects.sectionId, sections.id))
			.innerJoin(subjects, eq(sectionSubjects.subjectId, subjects.id))
			.where(
				and(
					eq(sectionSubjects.tenantId, tenantId),
					eq(sectionSubjects.teacherMembershipId, membershipId),
					isNull(sections.deletedAt),
					isNull(subjects.deletedAt),
				),
			);
	}

	async listSubjects(tenantId: string) {
		return this.database.db
			.select()
			.from(subjects)
			.where(and(eq(subjects.tenantId, tenantId), isNull(subjects.deletedAt)))
			.orderBy(asc(subjects.name));
	}

	async createSubject(input: typeof subjects.$inferInsert) {
		const [subject] = await this.database.db.insert(subjects).values(input).returning();
		return subject;
	}

	async assignSectionSubject(input: typeof sectionSubjects.$inferInsert) {
		const [row] = await this.database.db.insert(sectionSubjects).values(input).returning();
		return row;
	}

	async findMembership(tenantId: string, membershipId: string) {
		const [row] = await this.database.db
			.select()
			.from(memberships)
			.where(
				and(
					eq(memberships.id, membershipId),
					eq(memberships.tenantId, tenantId),
					eq(memberships.status, 'active'),
				),
			)
			.limit(1);
		return row ?? null;
	}

	async findTeacherMemberships(tenantId: string, membershipIds: string[]) {
		if (membershipIds.length === 0) return [];
		return this.database.db
			.select()
			.from(memberships)
			.where(
				and(
					eq(memberships.tenantId, tenantId),
					inArray(memberships.id, membershipIds),
					or(
						eq(memberships.role, 'teacher'),
						eq(memberships.role, 'principal'),
						eq(memberships.role, 'admin'),
					),
				),
			);
	}
}
