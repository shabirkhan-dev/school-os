import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { CampusesController } from './campuses.controller';
import { CampusesRepository } from './campuses.repository';
import { CampusesService } from './campuses.service';

@Module({
	imports: [AuthModule, PermissionsModule, MembershipsModule, TenantsModule],
	controllers: [CampusesController],
	providers: [CampusesRepository, CampusesService],
	exports: [CampusesService, CampusesRepository],
})
export class CampusesModule {}
