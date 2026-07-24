import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { CurrentTenant } from '@/modules/tenants/current-tenant.decorator';
import { TenantGuard } from '@/modules/tenants/tenant.guard';
import type { TenantContext } from '@/modules/tenants/tenant-context.types';
import { TimetableService } from './timetable.service';

@ApiTags('Timetable')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller({ path: 'tenants/:tenantId/timetable', version: '1' })
export class TimetableController {
	constructor(private readonly timetable: TimetableService) {}

	@Get('me/day')
	@ApiOperation({ summary: 'Get the current teacher schedule for a single day' })
	getMyDay(
		@CurrentTenant() tenant: TenantContext,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) _tenantId: string,
		@Query('date') date?: string,
	) {
		const resolvedDate = date ?? new Date().toISOString().slice(0, 10);
		return this.timetable.getMyDaySchedule(tenant, resolvedDate);
	}

	@Get('me/week')
	@ApiOperation({ summary: 'Get the current teacher schedule for the ISO week containing a date' })
	getMyWeek(
		@CurrentTenant() tenant: TenantContext,
		@Param('tenantId', new ParseUUIDPipe({ version: '4' })) _tenantId: string,
		@Query('date') date?: string,
	) {
		const resolvedDate = date ?? new Date().toISOString().slice(0, 10);
		return this.timetable.getMyWeekSchedule(tenant, resolvedDate);
	}
}
