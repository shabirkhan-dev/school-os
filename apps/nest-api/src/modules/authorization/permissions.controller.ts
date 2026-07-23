import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';

import { PermissionsService } from './permissions.service';

@ApiTags('Authorization')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'permissions', version: '1' })
export class PermissionsController {
	constructor(private readonly permissions: PermissionsService) {}

	@Get()
	@ApiOperation({ summary: 'List the global permission catalog' })
	async list() {
		const rows = await this.permissions.listCatalog();
		return {
			permissions: rows.map((permission) => ({
				id: permission.id,
				code: permission.code,
				module: permission.module,
				description: permission.description,
			})),
		};
	}
}
