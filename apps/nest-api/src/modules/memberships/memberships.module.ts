import { Module } from '@nestjs/common';

import { MembershipsRepository } from './memberships.repository';
import { MembershipsService } from './memberships.service';

@Module({
	providers: [MembershipsRepository, MembershipsService],
	exports: [MembershipsService, MembershipsRepository],
})
export class MembershipsModule {}
