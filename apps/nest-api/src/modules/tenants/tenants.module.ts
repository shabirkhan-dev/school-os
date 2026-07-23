import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantGuard } from './tenant.guard';
import { TenantConfigRepository } from './tenant-config.repository';
import { TenantConfigService } from './tenant-config.service';
import { TenantsController } from './tenants.controller';
import { TenantsRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

@Module({
	imports: [AuthModule, PermissionsModule, MembershipsModule],
	controllers: [TenantsController],
	providers: [
		TenantsRepository,
		TenantsService,
		TenantConfigRepository,
		TenantConfigService,
		TenantGuard,
	],
	exports: [
		TenantsService,
		TenantsRepository,
		TenantConfigService,
		TenantGuard,
		MembershipsModule,
		PermissionsModule,
	],
})
export class TenantsModule {}
