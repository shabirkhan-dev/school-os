import { Module } from '@nestjs/common';

import { PermissionsGuard } from './permissions.guard';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsService } from './permissions.service';

@Module({
	providers: [PermissionsRepository, PermissionsService, PermissionsGuard],
	exports: [PermissionsService, PermissionsGuard],
})
export class PermissionsModule {}
