import * as z from 'zod';

const dateSchema = z
	.string()
	.trim()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

const markStatusSchema = z.enum(['present', 'absent', 'late', 'excused', 'left_early', 'unknown']);

export const createAttendanceSessionSchema = z
	.object({
		sectionId: z.string().uuid(),
		sessionDate: dateSchema,
		sessionType: z.enum(['class', 'gate', 'bus']).optional(),
	})
	.strict();

export class CreateAttendanceSessionDto {
	static schema = createAttendanceSessionSchema;
	sectionId!: string;
	sessionDate!: string;
	sessionType?: 'class' | 'gate' | 'bus';
}

export const markAttendanceSchema = z
	.object({
		marks: z
			.array(
				z
					.object({
						studentId: z.string().uuid(),
						status: markStatusSchema,
					})
					.strict(),
			)
			.min(1)
			.max(200),
	})
	.strict();

export class MarkAttendanceDto {
	static schema = markAttendanceSchema;
	marks!: Array<{ studentId: string; status: z.infer<typeof markStatusSchema> }>;
}

export type CreateAttendanceSessionInput = z.infer<typeof createAttendanceSessionSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
