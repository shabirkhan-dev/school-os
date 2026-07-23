import { Module } from '@nestjs/common';

import { AuthModule } from '@/modules/auth/auth.module';
import { MembershipsModule } from '@/modules/memberships/memberships.module';
import { CampusesController } from './campuses.controller';
import { CampusesRepository } from './campuses.repository';
import { CampusesService } from './campuses.service';

@Module({
	imports: [AuthModule, MembershipsModule],
	controllers: [CampusesController],
	providers: [CampusesRepository, CampusesService],
	exports: [CampusesService, CampusesRepository],
})
export class CampusesModule {}
