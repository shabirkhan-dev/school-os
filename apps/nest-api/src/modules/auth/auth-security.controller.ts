import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

import { MfaService } from '@/modules/mfa/mfa.service';
import { PasskeysService } from '@/modules/passkeys/passkeys.service';
import { SocialAuthService } from '@/modules/social-auth/social-auth.service';
import type { AccessTokenPayload } from './auth.types';
import { CsrfGuard } from './csrf.guard';
import { CurrentUser } from './current-user.decorator';
import {
	GoogleCredentialBodyDto,
	PasskeyRegistrationBodyDto,
	TotpCodeBodyDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Account security')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, CsrfGuard)
@Controller({ path: 'auth/security', version: '1' })
export class AuthSecurityController {
	constructor(
		private readonly mfa: MfaService,
		private readonly passkeys: PasskeysService,
		private readonly social: SocialAuthService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Get MFA, passkey, and social-identity status' })
	async status(@CurrentUser() user: AccessTokenPayload) {
		const [mfa, passkeys, social] = await Promise.all([
			this.mfa.getStatus(user.sub),
			this.passkeys.list(user.sub),
			this.social.getStatus(user.sub),
		]);
		return { mfa, passkeys, social };
	}

	@Post('totp/setup')
	beginTotp(@CurrentUser() user: AccessTokenPayload) {
		return this.mfa.beginTotpSetup(user.sub);
	}

	@Post('totp/confirm')
	confirmTotp(@CurrentUser() user: AccessTokenPayload, @Body() body: TotpCodeBodyDto) {
		return this.mfa.confirmTotpSetup(user.sub, body.code);
	}

	@Post('totp/disable')
	disableTotp(@CurrentUser() user: AccessTokenPayload, @Body() body: TotpCodeBodyDto) {
		return this.mfa.disableTotp(user.sub, body.code);
	}

	@Post('passkeys/options')
	beginPasskey(@CurrentUser() user: AccessTokenPayload) {
		return this.passkeys.beginRegistration(user.sub);
	}

	@Post('passkeys')
	registerPasskey(
		@CurrentUser() user: AccessTokenPayload,
		@Body() body: PasskeyRegistrationBodyDto,
	) {
		return this.passkeys.finishRegistration({
			userId: user.sub,
			challengeId: body.challengeId,
			name: body.name,
			response: body.response as unknown as RegistrationResponseJSON,
		});
	}

	@Delete('passkeys/:passkeyId')
	deletePasskey(
		@CurrentUser() user: AccessTokenPayload,
		@Param('passkeyId', new ParseUUIDPipe({ version: '4' })) passkeyId: string,
	) {
		return this.passkeys.remove(user.sub, passkeyId);
	}

	@Post('google/link')
	linkGoogle(@CurrentUser() user: AccessTokenPayload, @Body() body: GoogleCredentialBodyDto) {
		return this.social.linkGoogle(user.sub, body.credential);
	}
}
