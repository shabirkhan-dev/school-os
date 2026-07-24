import * as z from "zod";

export const createTenantSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters").max(200),
	slug: z
		.string()
		.trim()
		.min(2)
		.max(80)
		.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
		.optional()
		.or(z.literal("")),
	mission: z.string().trim().max(2000).optional().or(z.literal("")),
	timezone: z.string().trim().max(64).optional().or(z.literal("")),
	defaultLocale: z.string().trim().max(16).optional().or(z.literal("")),
});

export const createCampusSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters").max(200),
	code: z
		.string()
		.trim()
		.min(2, "Code must be at least 2 characters")
		.max(32)
		.regex(/^[A-Za-z0-9_-]+$/, "Use letters, numbers, underscores, or hyphens"),
	address: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CreateTenantFormValues = z.infer<typeof createTenantSchema>;
export type CreateCampusFormValues = z.infer<typeof createCampusSchema>;

export const updateTenantSchema = z
	.object({
		name: z.string().trim().min(2, "Name must be at least 2 characters").max(200).optional(),
		mission: z.string().trim().max(2000).nullable().optional(),
		timezone: z.string().trim().min(1).max(64).optional(),
		defaultLocale: z.string().trim().min(2).max(16).optional(),
	})
	.refine((value) => Object.keys(value).length > 0, {
		message: "Change at least one field",
	});

export type UpdateTenantFormValues = z.infer<typeof updateTenantSchema>;

const timeSchema = z
	.string()
	.trim()
	.regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24-hour)");

const hexColorSchema = z
	.string()
	.trim()
	.regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #1A2B3C");

export const updateOrganizationConfigSchema = z
	.object({
		settings: z
			.object({
				academicYearStartMonth: z.number().int().min(1).max(12),
				attendanceGraceMinutes: z.number().int().min(0).max(120),
				quietHoursStart: timeSchema,
				quietHoursEnd: timeSchema,
			})
			.partial()
			.optional(),
		branding: z
			.object({
				displayNameEn: z.string().trim().min(1).max(200).nullable(),
				displayNameUr: z.string().trim().max(200).nullable(),
				logoUrl: z.string().trim().url().max(2048).nullable(),
				primaryColor: hexColorSchema.nullable(),
				accentColor: hexColorSchema.nullable(),
			})
			.partial()
			.optional(),
		communicationPolicy: z
			.object({
				whatsappEnabled: z.boolean(),
				smsFallbackEnabled: z.boolean(),
				emailFallbackEnabled: z.boolean(),
				notifyAllGuardians: z.boolean(),
				sickReportRequiresNote: z.boolean(),
			})
			.partial()
			.optional(),
	})
	.refine(
		(value) =>
			value.settings !== undefined ||
			value.branding !== undefined ||
			value.communicationPolicy !== undefined,
		{ message: "Change at least one field" },
	);

export type UpdateOrganizationConfigFormValues = z.infer<typeof updateOrganizationConfigSchema>;
