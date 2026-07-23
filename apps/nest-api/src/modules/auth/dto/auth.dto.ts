import * as z from 'zod';

const emailSchema = z.email().trim().toLowerCase().max(320);
const passwordSchema = z.string().min(12).max(128);
const otpSchema = z.string().regex(/^\d{6}$/, 'Code must contain exactly 6 digits');
const usernameSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(3)
	.max(64)
	.regex(
		/^[a-z0-9._-]+$/,
		'Username may only contain lowercase letters, numbers, dots, underscores, and hyphens',
	);

export const registerBodySchema = z
	.object({
		email: emailSchema,
		username: usernameSchema,
		password: passwordSchema,
	})
	.strict();

export const loginBodySchema = z
	.object({ email: emailSchema, password: z.string().min(1).max(128) })
	.strict();
export const emailBodySchema = z.object({ email: emailSchema }).strict();
export const verifyEmailBodySchema = z.object({ email: emailSchema, code: otpSchema }).strict();
export const resetPasswordBodySchema = z
	.object({ email: emailSchema, code: otpSchema, newPassword: passwordSchema })
	.strict();
export const changePasswordBodySchema = z
	.object({
		currentPassword: z.string().min(1).max(128),
		newPassword: passwordSchema,
	})
	.strict()
	.refine((input) => input.currentPassword !== input.newPassword, {
		path: ['newPassword'],
		message: 'New password must be different from the current password',
	});

export const challengeTokenBodySchema = z
	.object({ challengeToken: z.string().min(20).max(512), code: z.string().min(6).max(32) })
	.strict();
export const magicLinkBodySchema = z.object({ token: z.string().min(20).max(512) }).strict();
export const totpCodeBodySchema = z.object({ code: z.string().min(6).max(32) }).strict();
export const googleCredentialBodySchema = z
	.object({ credential: z.string().min(100).max(10_000) })
	.strict();
export const passkeyOptionsBodySchema = z.object({ email: emailSchema.optional() }).strict();
export const passkeyRegistrationBodySchema = z
	.object({
		challengeId: z.uuid(),
		name: z.string().trim().min(1).max(100),
		response: z.record(z.string(), z.unknown()),
	})
	.strict();
export const passkeyAuthenticationBodySchema = z
	.object({
		challengeId: z.uuid(),
		response: z.record(z.string(), z.unknown()),
	})
	.strict();

/** Optional body for native clients that store the refresh token in SecureStore. */
export const refreshBodySchema = z.preprocess(
	(value) => (value == null || value === '' ? {} : value),
	z
		.object({
			refreshToken: z.string().min(20).max(2048).optional(),
		})
		.strict(),
);

export const switchTenantBodySchema = z.object({ tenantId: z.uuid() }).strict();

export class RegisterBodyDto {
	static schema = registerBodySchema;
	email!: string;
	username!: string;
	password!: string;
}
export class LoginBodyDto {
	static schema = loginBodySchema;
	email!: string;
	password!: string;
}
export class EmailBodyDto {
	static schema = emailBodySchema;
	email!: string;
}
export class VerifyEmailBodyDto {
	static schema = verifyEmailBodySchema;
	email!: string;
	code!: string;
}
export class ResetPasswordBodyDto {
	static schema = resetPasswordBodySchema;
	email!: string;
	code!: string;
	newPassword!: string;
}
export class ChangePasswordBodyDto {
	static schema = changePasswordBodySchema;
	currentPassword!: string;
	newPassword!: string;
}
export class ChallengeTokenBodyDto {
	static schema = challengeTokenBodySchema;
	challengeToken!: string;
	code!: string;
}
export class MagicLinkBodyDto {
	static schema = magicLinkBodySchema;
	token!: string;
}
export class TotpCodeBodyDto {
	static schema = totpCodeBodySchema;
	code!: string;
}
export class GoogleCredentialBodyDto {
	static schema = googleCredentialBodySchema;
	credential!: string;
}
export class PasskeyOptionsBodyDto {
	static schema = passkeyOptionsBodySchema;
	email?: string;
}
export class PasskeyRegistrationBodyDto {
	static schema = passkeyRegistrationBodySchema;
	challengeId!: string;
	name!: string;
	response!: Record<string, unknown>;
}
export class PasskeyAuthenticationBodyDto {
	static schema = passkeyAuthenticationBodySchema;
	challengeId!: string;
	response!: Record<string, unknown>;
}
export class RefreshBodyDto {
	static schema = refreshBodySchema;
	refreshToken?: string;
}
export class SwitchTenantBodyDto {
	static schema = switchTenantBodySchema;
	tenantId!: string;
}

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type EmailBody = z.infer<typeof emailBodySchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
export type ChallengeTokenBody = z.infer<typeof challengeTokenBodySchema>;
export type MagicLinkBody = z.infer<typeof magicLinkBodySchema>;
export type RefreshBody = z.infer<typeof refreshBodySchema>;
export type SwitchTenantBody = z.infer<typeof switchTenantBodySchema>;
