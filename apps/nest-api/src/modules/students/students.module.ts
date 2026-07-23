import { Module } from '@nestjs/common';

import { AcademicModule } from '@/modules/academic/academic.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PermissionsModule } from '@/modules/authorization/permissions.module';
import { CampusesModule } from '@/modules/campuses/campuses.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

@Module({
	imports: [
		AuthModule,
		PermissionsModule,
		MembershipsModule,
		TenantsModule,
		CampusesModule,
		AcademicModule,
	],
	controllers: [StudentsController],
	providers: [StudentsRepository, StudentsService],
	exports: [StudentsService, StudentsRepository],
})
export class StudentsModule {}
