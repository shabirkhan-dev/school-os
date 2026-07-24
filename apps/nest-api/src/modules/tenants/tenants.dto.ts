import * as z from 'zod';

const tenantNameSchema = z.string().trim().min(2).max(200);
const tenantSlugSchema = z
	.string()
	.trim()
	.min(2)
	.max(80)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens');
const timezoneSchema = z.string().trim().min(1).max(64);
const localeSchema = z.string().trim().min(2).max(16);

export const createTenantSchema = z
	.object({
		name: tenantNameSchema,
		slug: tenantSlugSchema.optional(),
		mission: z.string().trim().max(2000).optional(),
		timezone: timezoneSchema.optional(),
		defaultLocale: localeSchema.optional(),
	})
	.strict();

export class CreateTenantDto {
	static schema = createTenantSchema;
	name!: string;
	slug?: string;
	mission?: string;
	timezone?: string;
	defaultLocale?: string;
}

export const updateTenantSchema = z
	.object({
		name: tenantNameSchema.optional(),
		mission: z.string().trim().max(2000).nullable().optional(),
		timezone: timezoneSchema.optional(),
		defaultLocale: localeSchema.optional(),
		status: z.enum(['active', 'suspended', 'archived']).optional(),
	})
	.strict()
	.refine((value) => Object.keys(value).length > 0, {
		message: 'At least one field is required',
	});

export class UpdateTenantDto {
	static schema = updateTenantSchema;
	name?: string;
	mission?: string | null;
	timezone?: string;
	defaultLocale?: string;
	status?: 'active' | 'suspended' | 'archived';
}

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
