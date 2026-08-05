import { Module } from '@nestjs/common';

import { AcademicModule } from '@/modules/academic/academic.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { GuardiansModule } from '@/modules/guardians/guardians.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { StaffModule } from '@/modules/staff/staff.module';
import { StudentsModule } from '@/modules/students/students.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceService } from './attendance.service';

@Module({
	imports: [
		AuthModule,
		PermissionsModule,
		MembershipsModule,
		TenantsModule,
		AcademicModule,
		StudentsModule,
		StaffModule,
		GuardiansModule,
	],
	controllers: [AttendanceController],
	providers: [AttendanceRepository, AttendanceService],
	exports: [AttendanceService, AttendanceRepository],
})
export class AttendanceModule {}
