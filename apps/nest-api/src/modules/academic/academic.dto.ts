import * as z from 'zod';

const dateSchema = z
	.string()
	.trim()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const createAcademicYearSchema = z
	.object({
		name: z.string().trim().min(2).max(64),
		startsOn: dateSchema,
		endsOn: dateSchema,
		status: z.enum(['draft', 'active', 'archived']).optional(),
	})
	.strict()
	.refine((value) => value.endsOn >= value.startsOn, {
		message: 'End date must be on or after start date',
		path: ['endsOn'],
	});

export class CreateAcademicYearDto {
	static schema = createAcademicYearSchema;
	name!: string;
	startsOn!: string;
	endsOn!: string;
	status?: 'draft' | 'active' | 'archived';
}

export const updateAcademicYearSchema = z
	.object({
		name: z.string().trim().min(2).max(64).optional(),
		startsOn: dateSchema.optional(),
		endsOn: dateSchema.optional(),
		status: z.enum(['draft', 'active', 'archived']).optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateAcademicYearDto {
	static schema = updateAcademicYearSchema;
	name?: string;
	startsOn?: string;
	endsOn?: string;
	status?: 'draft' | 'active' | 'archived';
}

export const createClassSchema = z
	.object({
		name: z.string().trim().min(1).max(120),
		sortOrder: z.number().int().min(0).max(999).optional(),
	})
	.strict();

export class CreateClassDto {
	static schema = createClassSchema;
	name!: string;
	sortOrder?: number;
}

export const updateClassSchema = z
	.object({
		name: z.string().trim().min(1).max(120).optional(),
		sortOrder: z.number().int().min(0).max(999).optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateClassDto {
	static schema = updateClassSchema;
	name?: string;
	sortOrder?: number;
}

export const createSectionSchema = z
	.object({
		campusId: z.string().uuid(),
		classId: z.string().uuid(),
		academicYearId: z.string().uuid(),
		name: z.string().trim().min(1).max(64),
		homeroomTeacherMembershipId: z.string().uuid().nullable().optional(),
	})
	.strict();

export class CreateSectionDto {
	static schema = createSectionSchema;
	campusId!: string;
	classId!: string;
	academicYearId!: string;
	name!: string;
	homeroomTeacherMembershipId?: string | null;
}

export const updateSectionSchema = z
	.object({
		name: z.string().trim().min(1).max(64).optional(),
		status: z.enum(['active', 'inactive']).optional(),
		homeroomTeacherMembershipId: z.string().uuid().nullable().optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateSectionDto {
	static schema = updateSectionSchema;
	name?: string;
	status?: 'active' | 'inactive';
	homeroomTeacherMembershipId?: string | null;
}

export const assignSectionTeacherSchema = z
	.object({
		membershipId: z.string().uuid(),
	})
	.strict();

export class AssignSectionTeacherDto {
	static schema = assignSectionTeacherSchema;
	membershipId!: string;
}

export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type UpdateClassInput = z.infer<typeof updateClassSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type AssignSectionTeacherInput = z.infer<typeof assignSectionTeacherSchema>;
