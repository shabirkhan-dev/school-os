import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { TenantsModule } from '@/modules/tenants/tenants.module';
import { TimetableController } from './timetable.controller';
import { TimetableRepository } from './timetable.repository';
import { TimetableService } from './timetable.service';

@Module({
	imports: [AuthModule, TenantsModule],
	controllers: [TimetableController],
	providers: [TimetableRepository, TimetableService],
	exports: [TimetableService, TimetableRepository],
})
export class TimetableModule {}
