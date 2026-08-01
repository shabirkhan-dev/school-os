import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { StaffModule } from '@/modules/staff/staff.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { ReportsController } from './reports.controller';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';

@Module({
	imports: [AuthModule, PermissionsModule, MembershipsModule, TenantsModule, StaffModule],
	controllers: [ReportsController],
	providers: [ReportsRepository, ReportsService],
	exports: [ReportsService],
})
export class ReportsModule {}
