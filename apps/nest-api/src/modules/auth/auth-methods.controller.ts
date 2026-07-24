import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import type { ClientAuthSession } from './auth.types';
import { CsrfGuard } from './csrf.guard';
import {
	ChallengeTokenBodyDto,
	EmailBodyDto,
	GoogleCredentialBodyDto,
	MagicLinkBodyDto,
	PasskeyAuthenticationBodyDto,
	PasskeyOptionsBodyDto,
} from './dto/auth.dto';
import { RefreshCookieService } from './refresh-cookie.service';
import { presentSession } from './session-response';

@ApiTags('Authentication methods')
@UseGuards(CsrfGuard)
@Controller({ path: 'auth/methods', version: '1' })
export class AuthMethodsController {
	constructor(
		private readonly auth: AuthService,
		private readonly refreshCookie: RefreshCookieService,
	) {}

	@Get()
	@ApiOperation({ summary: 'List configured authentication providers' })
	providers() {
		return this.auth.getAuthProviders();
	}

	@Post('two-factor/verify')
	@Throttle({ default: { limit: 8, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	async verifyTwoFactor(
		@Body() body: ChallengeTokenBodyDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<ClientAuthSession> {
		const result = await this.auth.completeMfaLogin(body, metadata(request));
		return presentSession(this.auth, this.refreshCookie, request, response, result);
	}

	@Post('magic-link/request')
	@Throttle({ default: { limit: 3, ttl: 60_000 } })
	@HttpCode(HttpStatus.ACCEPTED)
	requestMagicLink(@Body() body: EmailBodyDto) {
		return this.auth.requestMagicLink(body);
	}

	@Post('magic-link/consume')
	@Throttle({ default: { limit: 8, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	async consumeMagicLink(
		@Body() body: MagicLinkBodyDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<ClientAuthSession> {
		const result = await this.auth.consumeMagicLink(body.token, metadata(request));
		return presentSession(this.auth, this.refreshCookie, request, response, result);
	}

	@Post('google')
	@Throttle({ default: { limit: 10, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	async google(
		@Body() body: GoogleCredentialBodyDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<ClientAuthSession> {
		const result = await this.auth.googleLogin(body.credential, metadata(request));
		return presentSession(this.auth, this.refreshCookie, request, response, result);
	}

	@Post('passkeys/options')
	@Throttle({ default: { limit: 10, ttl: 60_000 } })
	options(@Body() body: PasskeyOptionsBodyDto) {
		return this.auth.beginPasskeyLogin(body.email);
	}

	@Post('passkeys/verify')
	@Throttle({ default: { limit: 10, ttl: 60_000 } })
	@HttpCode(HttpStatus.OK)
	async verifyPasskey(
		@Body() body: PasskeyAuthenticationBodyDto,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<ClientAuthSession> {
		const result = await this.auth.finishPasskeyLogin(
			{
				challengeId: body.challengeId,
				response: body.response as unknown as AuthenticationResponseJSON,
			},
			metadata(request),
		);
		return presentSession(this.auth, this.refreshCookie, request, response, result);
	}
}

function metadata(request: Request) {
	return {
		ipAddress: request.ip || null,
		userAgent: request.get('user-agent')?.slice(0, 512) ?? null,
	};
}
