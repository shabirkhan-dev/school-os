import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { StaffModule } from '@/modules/staff/staff.module';
import { StudentsModule } from '@/modules/students/students.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { HomeworkController } from './homework.controller';
import { HomeworkRepository } from './homework.repository';
import { HomeworkService } from './homework.service';

@Module({
	imports: [
		AuthModule,
		PermissionsModule,
		MembershipsModule,
		TenantsModule,
		StaffModule,
		StudentsModule,
	],
	controllers: [HomeworkController],
	providers: [HomeworkRepository, HomeworkService],
	exports: [HomeworkService, HomeworkRepository],
})
export class HomeworkModule {}
