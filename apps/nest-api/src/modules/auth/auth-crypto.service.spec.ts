import { describe, expect, it } from 'vitest';
import { AppConfigService } from '@/config/app-config.service';
import { AuthCryptoService } from './auth-crypto.service';

describe('AuthCryptoService', () => {
	const service = new AuthCryptoService(new AppConfigService());

	it('hashes passwords without storing the original value', async () => {
		const password = 'a-strong-test-password';
		const passwordHash = await service.hashPassword(password);

		expect(passwordHash).not.toBe(password);
		await expect(service.verifyPassword(password, passwordHash)).resolves.toBe(true);
		await expect(service.verifyPassword('incorrect-password', passwordHash)).resolves.toBe(false);
	});

	it('creates verifiable purpose-bound OTP hashes', () => {
		const hash = service.hashOtp('email_verification', 'starter@example.com', '123456');

		expect(service.verifyOtp('email_verification', 'starter@example.com', '123456', hash)).toBe(
			true,
		);
		expect(service.verifyOtp('password_reset', 'starter@example.com', '123456', hash)).toBe(false);
	});

	it('creates refresh tokens that reveal only the session identifier', () => {
		const sessionId = '9d3f45e6-f7df-4f64-8bd2-c20a2dd28722';
		const token = service.createRefreshToken(sessionId);
		const tokenHash = service.hashRefreshToken(token);

		expect(service.getSessionIdFromRefreshToken(token)).toBe(sessionId);
		expect(service.verifyRefreshToken(token, tokenHash)).toBe(true);
		expect(service.verifyRefreshToken(`${sessionId}.wrong`, tokenHash)).toBe(false);
	});

	it('encrypts authenticator secrets with authenticated encryption', () => {
		const encrypted = service.encryptSecret('BASE32-SECRET');
		expect(encrypted).not.toContain('BASE32-SECRET');
		expect(service.decryptSecret(encrypted)).toBe('BASE32-SECRET');
	});

	it('creates one-purpose challenge tokens', () => {
		const token = service.createChallengeToken('84c5bd4b-2a8f-4a89-85db-c22f45dc2ab9');
		const tokenHash = service.hashChallengeToken('magic_link', 'starter@example.com', token);
		expect(service.getChallengeId(token)).toBe('84c5bd4b-2a8f-4a89-85db-c22f45dc2ab9');
		expect(
			service.verifyChallengeToken('magic_link', 'starter@example.com', token, tokenHash),
		).toBe(true);
		expect(service.verifyChallengeToken('mfa_login', 'starter@example.com', token, tokenHash)).toBe(
			false,
		);
	});

	it('signs short-lived access tokens with session and optional tenant claims', async () => {
		const payload = {
			sub: 'a01a0cab-a947-44f0-bfcd-4b8e8c907534',
			sid: '9d3f45e6-f7df-4f64-8bd2-c20a2dd28722',
		};
		const signed = await service.signAccessToken(payload);

		await expect(service.verifyAccessToken(signed.token)).resolves.toEqual(payload);
		expect(signed.expiresAt.getTime()).toBeGreaterThan(Date.now());

		const tenantPayload = {
			...payload,
			tid: 'b12b0cab-a947-44f0-bfcd-4b8e8c907535',
			mid: 'c23c0cab-a947-44f0-bfcd-4b8e8c907536',
		};
		const tenantSigned = await service.signAccessToken(tenantPayload);
		await expect(service.verifyAccessToken(tenantSigned.token)).resolves.toEqual(tenantPayload);
	});
});
