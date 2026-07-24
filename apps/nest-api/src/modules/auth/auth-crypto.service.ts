import {
	createCipheriv,
	createDecipheriv,
	createHash,
	createHmac,
	randomBytes,
	randomInt,
	timingSafeEqual,
} from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';

import { AppConfigService } from '@/config/app-config.service';
import type { AuthChallengePurpose } from '@/database/schema';
import type { AccessTokenPayload } from './auth.types';

const JWT_ISSUER = 'school-os-api';
const JWT_AUDIENCE = 'school-os-web';

@Injectable()
export class AuthCryptoService {
	constructor(private readonly config: AppConfigService) {}

	hashPassword(password: string): Promise<string> {
		return hash(password, this.config.passwordBcryptRounds);
	}

	verifyPassword(password: string, passwordHash: string): Promise<boolean> {
		return compare(password, passwordHash);
	}

	generateOtp(): string {
		return randomInt(100_000, 1_000_000).toString();
	}

	hashOtp(purpose: AuthChallengePurpose, email: string, code: string): string {
		return createHmac('sha256', this.config.authTokenSecret)
			.update(`${purpose}:${email}:${code}`)
			.digest('hex');
	}

	verifyOtp(
		purpose: AuthChallengePurpose,
		email: string,
		code: string,
		expectedHash: string,
	): boolean {
		return safeHashEquals(this.hashOtp(purpose, email, code), expectedHash);
	}

	createChallengeToken(challengeId: string): string {
		return `${challengeId}.${randomBytes(32).toString('base64url')}`;
	}

	getChallengeId(token: string): string | null {
		const [challengeId, secret, ...rest] = token.split('.');
		return challengeId && secret && rest.length === 0 ? challengeId : null;
	}

	hashChallengeToken(purpose: AuthChallengePurpose, email: string, token: string): string {
		return this.hashOtp(purpose, email, token);
	}

	verifyChallengeToken(
		purpose: AuthChallengePurpose,
		email: string,
		token: string,
		expectedHash: string,
	): boolean {
		return safeHashEquals(this.hashChallengeToken(purpose, email, token), expectedHash);
	}

	generateRecoveryCode(): string {
		return `${randomBytes(4).toString('hex')}-${randomBytes(4).toString('hex')}`;
	}

	hashRecoveryCode(code: string): string {
		return createHmac('sha256', this.config.authTokenSecret)
			.update(`recovery:${code.trim().toLowerCase()}`)
			.digest('hex');
	}

	encryptSecret(value: string): string {
		const iv = randomBytes(12);
		const cipher = createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
		const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
		return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
	}

	decryptSecret(value: string): string {
		const [ivValue, tagValue, encryptedValue, ...rest] = value.split('.');
		if (!ivValue || !tagValue || !encryptedValue || rest.length > 0) {
			throw new Error('Encrypted secret has an invalid format');
		}
		const decipher = createDecipheriv(
			'aes-256-gcm',
			this.getEncryptionKey(),
			Buffer.from(ivValue, 'base64url'),
		);
		decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
		return Buffer.concat([
			decipher.update(Buffer.from(encryptedValue, 'base64url')),
			decipher.final(),
		]).toString('utf8');
	}

	createRefreshToken(sessionId: string): string {
		return `${sessionId}.${randomBytes(48).toString('base64url')}`;
	}

	hashRefreshToken(token: string): string {
		return createHash('sha256').update(token).digest('hex');
	}

	verifyRefreshToken(token: string, expectedHash: string): boolean {
		return safeHashEquals(this.hashRefreshToken(token), expectedHash);
	}

	getSessionIdFromRefreshToken(token: string): string | null {
		const [sessionId, secret, ...rest] = token.split('.');
		return sessionId && secret && rest.length === 0 ? sessionId : null;
	}

	async signAccessToken(payload: AccessTokenPayload): Promise<{
		token: string;
		expiresAt: Date;
	}> {
		const expiresAt = new Date(Date.now() + parseDurationMs(this.config.jwtAccessExpiresIn));
		const claims: Record<string, string> = { sid: payload.sid };
		if (payload.tid) claims.tid = payload.tid;
		if (payload.mid) claims.mid = payload.mid;

		const token = await new SignJWT(claims)
			.setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
			.setIssuer(JWT_ISSUER)
			.setAudience(JWT_AUDIENCE)
			.setSubject(payload.sub)
			.setIssuedAt()
			.setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
			.sign(this.getJwtKey());
		return { token, expiresAt };
	}

	async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
		try {
			const { payload } = await jwtVerify(token, this.getJwtKey(), {
				algorithms: ['HS256'],
				issuer: JWT_ISSUER,
				audience: JWT_AUDIENCE,
			});
			const sub = typeof payload.sub === 'string' ? payload.sub : null;
			const sid = typeof payload.sid === 'string' ? payload.sid : null;
			const tid = typeof payload.tid === 'string' ? payload.tid : undefined;
			const mid = typeof payload.mid === 'string' ? payload.mid : undefined;
			if (!sub || !sid) {
				throw new Error('Missing token claims');
			}
			if ((tid && !mid) || (!tid && mid)) {
				throw new Error('Tenant claims must appear together');
			}
			return { sub, sid, ...(tid && mid ? { tid, mid } : {}) };
		} catch {
			throw new UnauthorizedException({
				code: 'AUTH_ACCESS_TOKEN_INVALID',
				message: 'Invalid or expired access token',
			});
		}
	}

	private getJwtKey(): Uint8Array {
		return new TextEncoder().encode(this.config.jwtSecret);
	}

	private getEncryptionKey(): Buffer {
		// codeql[js/insufficient-password-hash]: SHA-256 derives an AES key, not a password hash.
		return createHash('sha256').update(this.config.authTokenSecret).digest();
	}
}

function safeHashEquals(actual: string, expected: string): boolean {
	const actualBuffer = Buffer.from(actual, 'hex');
	const expectedBuffer = Buffer.from(expected, 'hex');
	return (
		actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
	);
}

function parseDurationMs(value: string): number {
	const match = /^(\d+)([smhd])$/.exec(value);
	if (!match) {
		throw new Error('JWT_ACCESS_EXPIRES_IN must use a duration such as 15m or 1h');
	}
	const amount = Number(match[1]);
	const unit = match[2];
	const multiplier = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit as 's'];
	return amount * multiplier;
}
