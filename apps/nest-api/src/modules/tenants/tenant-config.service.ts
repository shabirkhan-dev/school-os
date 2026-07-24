import { Injectable, NotFoundException } from '@nestjs/common';

import type {
	TenantBrandingRecord,
	TenantCommunicationPolicyRecord,
	TenantSettingsRecord,
} from '@/database/schema';
import { MembershipsService } from '@/modules/memberships/memberships.service';
import type { UpdateOrganizationConfigInput } from './tenant-config.dto';
import { TenantConfigRepository } from './tenant-config.repository';
import { formatTimeValue, type PublicOrganizationConfig } from './tenant-config.types';
import { TenantsRepository } from './tenants.repository';

@Injectable()
export class TenantConfigService {
	constructor(
		private readonly tenantConfig: TenantConfigRepository,
		private readonly tenants: TenantsRepository,
		private readonly membershipAccess: MembershipsService,
	) {}

	async getForUser(
		userId: string,
		tenantId: string,
	): Promise<{ config: PublicOrganizationConfig }> {
		await this.membershipAccess.requireActiveMembership(userId, tenantId);
		const tenant = await this.requireTenant(tenantId);
		const config = await this.loadConfig(tenant.id, tenant.name);
		return { config };
	}

	async updateForUser(
		userId: string,
		tenantId: string,
		input: UpdateOrganizationConfigInput,
	): Promise<{ config: PublicOrganizationConfig }> {
		await this.membershipAccess.requireManagementAccess(userId, tenantId);
		const tenant = await this.requireTenant(tenantId);
		await this.tenantConfig.ensureDefaults(tenant.id, tenant.name);

		if (input.settings) {
			await this.tenantConfig.updateSettings(tenant.id, {
				academicYearStartMonth: input.settings.academicYearStartMonth,
				attendanceGraceMinutes: input.settings.attendanceGraceMinutes,
				quietHoursStart: input.settings.quietHoursStart,
				quietHoursEnd: input.settings.quietHoursEnd,
			});
		}

		if (input.branding) {
			await this.tenantConfig.updateBranding(tenant.id, {
				displayNameEn:
					input.branding.displayNameEn === undefined
						? undefined
						: (input.branding.displayNameEn?.trim() ?? null),
				displayNameUr:
					input.branding.displayNameUr === undefined
						? undefined
						: (input.branding.displayNameUr?.trim() ?? null),
				logoUrl:
					input.branding.logoUrl === undefined
						? undefined
						: (input.branding.logoUrl?.trim() ?? null),
				primaryColor: input.branding.primaryColor,
				accentColor: input.branding.accentColor,
			});
		}

		if (input.communicationPolicy) {
			await this.tenantConfig.updateCommunicationPolicy(tenant.id, input.communicationPolicy);
		}

		const config = await this.loadConfig(tenant.id, tenant.name);
		return { config };
	}

	async seedDefaultsForTenant(tenantId: string, tenantName: string) {
		await this.tenantConfig.ensureDefaults(tenantId, tenantName);
	}

	private async loadConfig(
		tenantId: string,
		tenantName: string,
	): Promise<PublicOrganizationConfig> {
		await this.tenantConfig.ensureDefaults(tenantId, tenantName);
		const rows = await this.tenantConfig.findByTenantId(tenantId);

		if (!rows.settings || !rows.branding || !rows.communicationPolicy) {
			throw new NotFoundException({
				code: 'TENANT_CONFIG_NOT_FOUND',
				message: 'Organization config not found',
			});
		}

		return {
			settings: toPublicSettings(rows.settings),
			branding: toPublicBranding(rows.branding),
			communicationPolicy: toPublicCommunicationPolicy(rows.communicationPolicy),
		};
	}

	private async requireTenant(tenantId: string) {
		const tenant = await this.tenants.findById(tenantId);
		if (!tenant) {
			throw new NotFoundException({
				code: 'TENANT_NOT_FOUND',
				message: 'Tenant not found',
			});
		}
		return tenant;
	}
}

function toPublicSettings(settings: TenantSettingsRecord) {
	return {
		academicYearStartMonth: settings.academicYearStartMonth,
		attendanceGraceMinutes: settings.attendanceGraceMinutes,
		quietHoursStart: formatTimeValue(settings.quietHoursStart),
		quietHoursEnd: formatTimeValue(settings.quietHoursEnd),
	};
}

function toPublicBranding(branding: TenantBrandingRecord) {
	return {
		displayNameEn: branding.displayNameEn,
		displayNameUr: branding.displayNameUr,
		logoUrl: branding.logoUrl,
		primaryColor: branding.primaryColor,
		accentColor: branding.accentColor,
	};
}

function toPublicCommunicationPolicy(policy: TenantCommunicationPolicyRecord) {
	return {
		whatsappEnabled: policy.whatsappEnabled,
		smsFallbackEnabled: policy.smsFallbackEnabled,
		emailFallbackEnabled: policy.emailFallbackEnabled,
		notifyAllGuardians: policy.notifyAllGuardians,
		sickReportRequiresNote: policy.sickReportRequiresNote,
	};
}
