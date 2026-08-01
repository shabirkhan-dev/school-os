import * as z from 'zod';

const dateSchema = z
	.string()
	.trim()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

const reportsTermSchema = z.enum(['term1', 'term2', 'term3', 'final']);

export const overviewQuerySchema = z
	.object({
		sectionId: z.string().uuid().optional(),
	})
	.strict();

export const gradesReportQuerySchema = z
	.object({
		sectionId: z.string().uuid(),
		term: reportsTermSchema.optional(),
	})
	.strict();

export const attendanceReportQuerySchema = z
	.object({
		sectionId: z.string().uuid(),
		from: dateSchema.optional(),
		to: dateSchema.optional(),
	})
	.strict()
	.refine((value) => !(value.from && value.to && value.from > value.to), {
		message: '"from" date must not be after "to" date',
		path: ['from'],
	});

export const homeworkReportQuerySchema = z
	.object({
		sectionId: z.string().uuid(),
	})
	.strict();

export class OverviewQueryDto {
	static schema = overviewQuerySchema;
	sectionId?: string;
}

export class GradesReportQueryDto {
	static schema = gradesReportQuerySchema;
	sectionId!: string;
	term?: z.infer<typeof reportsTermSchema>;
}

export class AttendanceReportQueryDto {
	static schema = attendanceReportQuerySchema;
	sectionId!: string;
	from?: string;
	to?: string;
}

export class HomeworkReportQueryDto {
	static schema = homeworkReportQuerySchema;
	sectionId!: string;
}

export type OverviewQuery = z.infer<typeof overviewQuerySchema>;
export type GradesReportQuery = z.infer<typeof gradesReportQuerySchema>;
export type AttendanceReportQuery = z.infer<typeof attendanceReportQuerySchema>;
export type HomeworkReportQuery = z.infer<typeof homeworkReportQuerySchema>;
