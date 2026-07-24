import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { NavigationController } from './navigation.controller';
import { NavigationRepository } from './navigation.repository';
import { NavigationService } from './navigation.service';

@Module({
	imports: [AuthModule, PermissionsModule, MembershipsModule, TenantsModule],
	controllers: [NavigationController],
	providers: [NavigationRepository, NavigationService],
	exports: [NavigationService],
})
export class NavigationModule {}
