import { Module } from '@nestjs/common';

import { PermissionsModule } from '@/modules/authorization/permissions.module';

import { MembershipsRepository } from './memberships.repository';
import { MembershipsService } from './memberships.service';

@Module({
	imports: [PermissionsModule],
	providers: [MembershipsRepository, MembershipsService],
	exports: [MembershipsService, MembershipsRepository],
})
export class MembershipsModule {}
