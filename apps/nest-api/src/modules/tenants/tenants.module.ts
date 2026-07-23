import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantsController } from './tenants.controller';
import { TenantsRepository } from './tenants.repository';
import { TenantsService } from './tenants.service';

@Module({
	imports: [AuthModule, MembershipsModule],
	controllers: [TenantsController],
	providers: [TenantsRepository, TenantsService],
	exports: [TenantsService, TenantsRepository],
})
export class TenantsModule {}
