import * as z from 'zod';

const homeworkStatusSchema = z.enum(['draft', 'published', 'closed']);
const assignModeSchema = z.enum(['whole_class', 'selected_students']);

export const createHomeworkSchema = z
	.object({
		sectionSubjectId: z.string().uuid(),
		title: z.string().trim().min(1).max(200),
		description: z.string().trim().max(5000).optional(),
		dueAt: z.string().datetime().optional(),
		status: homeworkStatusSchema.optional(),
		assignMode: assignModeSchema.optional(),
		studentIds: z.array(z.string().uuid()).max(200).optional(),
		estimatedMinutes: z.number().int().positive().max(480).optional(),
		materials: z.string().trim().max(5000).optional(),
	})
	.strict()
	.refine(
		(value) =>
			value.assignMode !== 'selected_students' ||
			(value.studentIds !== undefined && value.studentIds.length > 0),
		{
			message: 'Select at least one student when targeting specific students',
			path: ['studentIds'],
		},
	);

export class CreateHomeworkDto {
	static schema = createHomeworkSchema;
	sectionSubjectId!: string;
	title!: string;
	description?: string;
	dueAt?: string;
	status?: z.infer<typeof homeworkStatusSchema>;
	assignMode?: z.infer<typeof assignModeSchema>;
	studentIds?: string[];
	estimatedMinutes?: number;
	materials?: string;
}

export const updateHomeworkSchema = z
	.object({
		title: z.string().trim().min(1).max(200).optional(),
		description: z.string().trim().max(5000).nullable().optional(),
		dueAt: z.string().datetime().nullable().optional(),
		status: homeworkStatusSchema.optional(),
		assignMode: assignModeSchema.optional(),
		studentIds: z.array(z.string().uuid()).max(200).optional(),
		estimatedMinutes: z.number().int().positive().max(480).nullable().optional(),
		materials: z.string().trim().max(5000).nullable().optional(),
	})
	.strict()
	.refine(
		(value) =>
			value.assignMode !== 'selected_students' ||
			(value.studentIds !== undefined && value.studentIds.length > 0),
		{
			message: 'Select at least one student when targeting specific students',
			path: ['studentIds'],
		},
	);

export class UpdateHomeworkDto {
	static schema = updateHomeworkSchema;
	title?: string;
	description?: string | null;
	dueAt?: string | null;
	status?: z.infer<typeof homeworkStatusSchema>;
	assignMode?: z.infer<typeof assignModeSchema>;
	studentIds?: string[];
	estimatedMinutes?: number | null;
	materials?: string | null;
}

export const listHomeworkQuerySchema = z
	.object({
		sectionSubjectId: z.string().uuid().optional(),
		status: homeworkStatusSchema.optional(),
	})
	.strict();

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>;
export type ListHomeworkQuery = z.infer<typeof listHomeworkQuerySchema>;
