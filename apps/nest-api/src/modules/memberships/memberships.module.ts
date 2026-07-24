import { Module } from '@nestjs/common';

import { PermissionsModule } from '@/modules/authorization/permissions.module';

import { MembershipInvitesService } from './membership-invites.service';
import { MembershipsRepository } from './memberships.repository';
import { MembershipsService } from './memberships.service';

@Module({
	imports: [PermissionsModule],
	providers: [MembershipsRepository, MembershipsService, MembershipInvitesService],
	exports: [MembershipsService, MembershipsRepository, MembershipInvitesService],
})
export class MembershipsModule {}
