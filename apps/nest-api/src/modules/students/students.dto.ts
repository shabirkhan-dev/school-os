import * as z from 'zod';

const dateSchema = z
	.string()
	.trim()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

const studentCodeSchema = z
	.string()
	.trim()
	.min(2)
	.max(32)
	.regex(/^[A-Za-z0-9-]+$/, 'Student code may only contain letters, numbers, and hyphens');

export const createStudentSchema = z
	.object({
		campusId: z.string().uuid(),
		studentCode: studentCodeSchema,
		firstName: z.string().trim().min(1).max(100),
		lastName: z.string().trim().min(1).max(100),
		dateOfBirth: dateSchema.optional(),
		gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
		status: z.enum(['active', 'inactive', 'graduated', 'withdrawn']).optional(),
	})
	.strict();

export class CreateStudentDto {
	static schema = createStudentSchema;
	campusId!: string;
	studentCode!: string;
	firstName!: string;
	lastName!: string;
	dateOfBirth?: string;
	gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
	status?: 'active' | 'inactive' | 'graduated' | 'withdrawn';
}

export const updateStudentSchema = z
	.object({
		firstName: z.string().trim().min(1).max(100).optional(),
		lastName: z.string().trim().min(1).max(100).optional(),
		dateOfBirth: dateSchema.nullable().optional(),
		gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable().optional(),
		status: z.enum(['active', 'inactive', 'graduated', 'withdrawn']).optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateStudentDto {
	static schema = updateStudentSchema;
	firstName?: string;
	lastName?: string;
	dateOfBirth?: string | null;
	gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
	status?: 'active' | 'inactive' | 'graduated' | 'withdrawn';
}

export const createEnrollmentSchema = z
	.object({
		sectionId: z.string().uuid(),
		academicYearId: z.string().uuid(),
		enrolledOn: dateSchema.optional(),
	})
	.strict();

export class CreateEnrollmentDto {
	static schema = createEnrollmentSchema;
	sectionId!: string;
	academicYearId!: string;
	enrolledOn?: string;
}

export const updateEnrollmentSchema = z
	.object({
		status: z.enum(['active', 'transferred', 'withdrawn']).optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateEnrollmentDto {
	static schema = updateEnrollmentSchema;
	status?: 'active' | 'transferred' | 'withdrawn';
}

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;
