import * as z from 'zod';

export const paginationSchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(50),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export function paginationOffset(input: PaginationInput): { offset: number; limit: number } {
	return { offset: (input.page - 1) * input.limit, limit: input.limit };
}
