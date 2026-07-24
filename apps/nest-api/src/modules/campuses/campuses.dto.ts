import * as z from 'zod';

const campusNameSchema = z.string().trim().min(2).max(200);
const campusCodeSchema = z
	.string()
	.trim()
	.min(2)
	.max(32)
	.regex(/^[A-Za-z0-9_-]+$/, 'Code must use letters, numbers, underscores, or hyphens');

export const createCampusSchema = z
	.object({
		name: campusNameSchema,
		code: campusCodeSchema,
		address: z.string().trim().max(500).optional(),
		geoLat: z.number().min(-90).max(90).optional(),
		geoLng: z.number().min(-180).max(180).optional(),
	})
	.strict();

export class CreateCampusDto {
	static schema = createCampusSchema;
	name!: string;
	code!: string;
	address?: string;
	geoLat?: number;
	geoLng?: number;
}

export const updateCampusSchema = z
	.object({
		name: campusNameSchema.optional(),
		address: z.string().trim().max(500).nullable().optional(),
		geoLat: z.number().min(-90).max(90).nullable().optional(),
		geoLng: z.number().min(-180).max(180).nullable().optional(),
		status: z.enum(['active', 'inactive']).optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateCampusDto {
	static schema = updateCampusSchema;
	name?: string;
	address?: string | null;
	geoLat?: number | null;
	geoLng?: number | null;
	status?: 'active' | 'inactive';
}

export type CreateCampusInput = z.infer<typeof createCampusSchema>;
export type UpdateCampusInput = z.infer<typeof updateCampusSchema>;
