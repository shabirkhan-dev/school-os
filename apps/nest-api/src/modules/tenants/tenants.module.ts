import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantGuard } from './tenant.guard';
import { TenantsController } from './tenants.controller';
import { TenantsRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

@Module({
	imports: [AuthModule, PermissionsModule, MembershipsModule],
	controllers: [TenantsController],
	providers: [TenantsRepository, TenantsService, TenantGuard],
	exports: [TenantsService, TenantsRepository, TenantGuard],
})
export class TenantsModule {}
