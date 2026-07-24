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

const admissionGuardianSchema = z
	.object({
		firstName: z.string().trim().min(1).max(100),
		lastName: z.string().trim().min(1).max(100),
		email: z.string().trim().email().optional(),
		phone: z.string().trim().max(32).optional(),
		alternatePhone: z.string().trim().max(32).optional(),
		occupation: z.string().trim().max(128).optional(),
		preferredChannel: z.enum(['email', 'phone', 'whatsapp', 'sms']).optional(),
		relationship: z.enum([
			'father',
			'mother',
			'guardian',
			'step_parent',
			'grandparent',
			'sibling',
			'other',
		]),
		isPrimary: z.boolean().optional(),
		canPickup: z.boolean().optional(),
		receivesNotifications: z.boolean().optional(),
	})
	.strict();

const studentProfileFields = {
	middleName: z.string().trim().max(100).optional(),
	email: z.string().trim().email().optional(),
	phone: z.string().trim().max(32).optional(),
	addressLine1: z.string().trim().max(255).optional(),
	addressLine2: z.string().trim().max(255).optional(),
	city: z.string().trim().max(100).optional(),
	state: z.string().trim().max(100).optional(),
	postalCode: z.string().trim().max(20).optional(),
	country: z.string().trim().max(100).optional(),
	bloodGroup: z.string().trim().max(8).optional(),
	medicalNotes: z.string().trim().max(2000).optional(),
	emergencyContactName: z.string().trim().max(200).optional(),
	emergencyContactPhone: z.string().trim().max(32).optional(),
	admittedOn: dateSchema.optional(),
	previousSchool: z.string().trim().max(255).optional(),
};

export const createStudentSchema = z
	.object({
		campusId: z.string().uuid(),
		studentCode: studentCodeSchema,
		firstName: z.string().trim().min(1).max(100),
		lastName: z.string().trim().min(1).max(100),
		dateOfBirth: dateSchema.optional(),
		gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
		status: z.enum(['active', 'inactive', 'graduated', 'withdrawn']).optional(),
		guardians: z.array(admissionGuardianSchema).max(5).optional(),
		...studentProfileFields,
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
	guardians?: z.infer<typeof admissionGuardianSchema>[];
	middleName?: string;
	email?: string;
	phone?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	bloodGroup?: string;
	medicalNotes?: string;
	emergencyContactName?: string;
	emergencyContactPhone?: string;
	admittedOn?: string;
	previousSchool?: string;
}

export const updateStudentSchema = z
	.object({
		firstName: z.string().trim().min(1).max(100).optional(),
		lastName: z.string().trim().min(1).max(100).optional(),
		middleName: z.string().trim().max(100).nullable().optional(),
		dateOfBirth: dateSchema.nullable().optional(),
		gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).nullable().optional(),
		status: z.enum(['active', 'inactive', 'graduated', 'withdrawn']).optional(),
		email: z.string().trim().email().nullable().optional(),
		phone: z.string().trim().max(32).nullable().optional(),
		addressLine1: z.string().trim().max(255).nullable().optional(),
		addressLine2: z.string().trim().max(255).nullable().optional(),
		city: z.string().trim().max(100).nullable().optional(),
		state: z.string().trim().max(100).nullable().optional(),
		postalCode: z.string().trim().max(20).nullable().optional(),
		country: z.string().trim().max(100).nullable().optional(),
		bloodGroup: z.string().trim().max(8).nullable().optional(),
		medicalNotes: z.string().trim().max(2000).nullable().optional(),
		emergencyContactName: z.string().trim().max(200).nullable().optional(),
		emergencyContactPhone: z.string().trim().max(32).nullable().optional(),
		admittedOn: dateSchema.nullable().optional(),
		previousSchool: z.string().trim().max(255).nullable().optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateStudentDto {
	static schema = updateStudentSchema;
	firstName?: string;
	lastName?: string;
	middleName?: string | null;
	dateOfBirth?: string | null;
	gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
	status?: 'active' | 'inactive' | 'graduated' | 'withdrawn';
	email?: string | null;
	phone?: string | null;
	addressLine1?: string | null;
	addressLine2?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
	bloodGroup?: string | null;
	medicalNotes?: string | null;
	emergencyContactName?: string | null;
	emergencyContactPhone?: string | null;
	admittedOn?: string | null;
	previousSchool?: string | null;
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
