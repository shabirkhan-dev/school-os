import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { CampusesModule } from '@/modules/campuses/campuses.module';
import { EmailModule } from '@/modules/email/email.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { UsersModule } from '@/modules/users/users.module';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

@Module({
	imports: [
		AuthModule,
		PermissionsModule,
		MembershipsModule,
		UsersModule,
		TenantsModule,
		CampusesModule,
		EmailModule,
	],
	controllers: [MembersController],
	providers: [MembersService],
	exports: [MembersService],
})
export class MembersModule {}
