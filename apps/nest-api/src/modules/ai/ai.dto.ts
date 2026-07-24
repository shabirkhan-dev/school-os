import * as z from 'zod';

export const assistMessageSchema = z
	.object({
		role: z.enum(['user', 'assistant', 'system']),
		content: z.string().trim().min(1).max(8_000),
	})
	.strict();

export const assistRequestSchema = z
	.object({
		messages: z.array(assistMessageSchema).min(1).max(40),
		context: z.string().trim().max(4_000).optional(),
	})
	.strict();

export const academicDraftRequestSchema = z
	.object({
		kind: z.enum(['homework', 'assessment']),
		topic: z.string().trim().min(1).max(200),
		subjectName: z.string().trim().max(120).optional(),
		sectionName: z.string().trim().max(120).optional(),
		gradeLevel: z.string().trim().max(80).optional(),
		durationMinutes: z.number().int().positive().max(480).optional(),
		maxScore: z.number().positive().max(10000).optional(),
		assessmentType: z.enum(['quiz', 'test', 'exam']).optional(),
		tone: z.enum(['standard', 'challenge', 'support']).optional(),
	})
	.strict();

export class AssistRequestDto {
	static schema = assistRequestSchema;
	messages!: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
	context?: string;
}

export class AcademicDraftRequestDto {
	static schema = academicDraftRequestSchema;
	kind!: 'homework' | 'assessment';
	topic!: string;
	subjectName?: string;
	sectionName?: string;
	gradeLevel?: string;
	durationMinutes?: number;
	maxScore?: number;
	assessmentType?: 'quiz' | 'test' | 'exam';
	tone?: 'standard' | 'challenge' | 'support';
}

export type AssistRequestInput = z.infer<typeof assistRequestSchema>;
export type AcademicDraftRequestInput = z.infer<typeof academicDraftRequestSchema>;

export type AssistResponse = {
	reply: string;
	provider: string;
	model: string;
};

export type AcademicDraftResponse = {
	title: string;
	description: string;
	materials: string | null;
	instructions: string | null;
	provider: string;
	model: string;
};
