import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { StaffController } from './staff.controller';
import { StaffRepository } from './staff.repository';
import { StaffService } from './staff.service';

@Module({
	imports: [AuthModule, PermissionsModule, MembershipsModule, TenantsModule],
	controllers: [StaffController],
	providers: [StaffRepository, StaffService],
	exports: [StaffService, StaffRepository],
})
export class StaffModule {}
