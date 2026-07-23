import { Module } from '@nestjs/common';
import { EmailModule } from '@/modules/email/email.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { MfaModule } from '@/modules/mfa/mfa.module';
import { PasskeysModule } from '@/modules/passkeys/passkeys.module';
import { SocialAuthModule } from '@/modules/social-auth/social-auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthCryptoModule } from './auth-crypto.module';
import { AuthMethodsController } from './auth-methods.controller';
import { AuthSecurityController } from './auth-security.controller';
import { CsrfGuard } from './csrf.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RefreshCookieService } from './refresh-cookie.service';

@Module({
	imports: [
		UsersModule,
		EmailModule,
		AuthCryptoModule,
		MfaModule,
		PasskeysModule,
		SocialAuthModule,
		MembershipsModule,
	],
	controllers: [AuthController, AuthMethodsController, AuthSecurityController],
	providers: [AuthRepository, AuthService, CsrfGuard, JwtAuthGuard, RefreshCookieService],
	exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
