import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { StaffModule } from '@/modules/staff/staff.module';
import { StudentsModule } from '@/modules/students/students.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsRepository } from './assessments.repository';
import { AssessmentsService } from './assessments.service';

@Module({
	imports: [
		AuthModule,
		PermissionsModule,
		MembershipsModule,
		TenantsModule,
		StaffModule,
		StudentsModule,
	],
	controllers: [AssessmentsController],
	providers: [AssessmentsRepository, AssessmentsService],
	exports: [AssessmentsService, AssessmentsRepository],
})
export class AssessmentsModule {}
