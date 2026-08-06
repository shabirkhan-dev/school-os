import type { User } from "@/modules/users/types/user.types";

export interface TenantContext {
	id: string;
	tenantId: string;
	membershipId: string;
	role: string;
	permissions: string[];
}

export interface AuthSession {
	accessToken: string;
	accessTokenExpiresAt: string;
	/** Present for native clients (SecureStore); omitted for cookie-based web clients. */
	refreshToken?: string;
	user: User;
	tenantContext?: TenantContext | null;
}

export interface TwoFactorChallenge {
	requiresTwoFactor: true;
	challengeToken: string;
	expiresAt: string;
	methods: Array<"totp" | "recovery_code">;
}

export type LoginResult = AuthSession | TwoFactorChallenge;

export interface AuthChallengeResult {
	accepted: true;
	message: string;
	developmentCode?: string;
	developmentToken?: string;
}

export interface RegistrationResult extends AuthChallengeResult {
	user: User;
}

export interface LoginInput {
	email: string;
	password: string;
}

export interface RegisterInput {
	email: string;
	username: string;
	password: string;
}

export interface VerifyEmailInput {
	email: string;
	code: string;
}

export interface ResetPasswordInput {
	email: string;
	code: string;
	newPassword: string;
}

export interface ChangePasswordInput {
	currentPassword: string;
	newPassword: string;
}

export interface TwoFactorInput {
	challengeToken: string;
	code: string;
}

export interface SessionInfo {
	id: string;
	userAgent: string | null;
	ipAddress: string | null;
	createdAt: string;
	lastUsedAt: string;
	expiresAt: string;
	isCurrent: boolean;
}

export interface PasskeyView {
	id: string;
	name: string;
	deviceType: string;
	backedUp: boolean;
	lastUsedAt: string | null;
	createdAt: string;
}

export interface SecurityStatus {
	mfa: { totpEnabled: boolean; recoveryCodesRemaining: number };
	passkeys: PasskeyView[];
	social: { googleLinked: boolean };
}

export interface TotpSetup {
	secret: string;
	uri: string;
	qrCodeDataUrl: string;
}

export interface PasskeyRegistrationOptions {
	challengeId: string;
	options: Record<string, unknown>;
}

export interface PasskeyAuthenticationOptions {
	challengeId: string;
	options: Record<string, unknown>;
}

export type AuthenticationResponseJSON = Record<string, unknown>;
export type RegistrationResponseJSON = Record<string, unknown>;
