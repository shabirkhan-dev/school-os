import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { CampusesModule } from '@/modules/campuses/campuses.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { AcademicController } from './academic.controller';
import { AcademicRepository } from './academic.repository';
import { AcademicService } from './academic.service';

@Module({
	imports: [AuthModule, PermissionsModule, MembershipsModule, TenantsModule, CampusesModule],
	controllers: [AcademicController],
	providers: [AcademicRepository, AcademicService],
	exports: [AcademicService, AcademicRepository],
})
export class AcademicModule {}
