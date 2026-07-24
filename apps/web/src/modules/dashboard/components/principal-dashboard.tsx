"use client";

import { Building03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";
import { useDashboardI18n } from "../i18n/dashboard-i18n-provider";
import { AdminDashboard } from "./admin-dashboard";
import { PrincipalSchoolPulse } from "./principal-school-pulse";

export function PrincipalDashboard() {
	const { activeTenant, campuses } = useTenantContext();
	const { can } = usePermissions();
	const { t } = useDashboardI18n();
	const metricsEnabled = can(PermissionCodes.STUDENTS_READ);
	const locationWord = campuses.length === 1 ? t("principal.location") : t("principal.locations");

	return (
		<div className="mx-auto w-full min-w-0 max-w-[1600px]">
			<div className="border-dashboard-border border-b bg-dashboard-surface/40 px-4 py-4 sm:px-6 lg:px-8">
				<div className="flex flex-wrap items-start gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={Building03Icon} size={20} strokeWidth={1.8} />
					</div>
					<div>
						<h1 className="font-semibold text-[22px] text-dashboard-text-primary">
							{t("principal.commandCenter")}
						</h1>
						<p className="max-w-2xl text-dashboard-text-muted text-sm">
							{activeTenant?.name ?? t("common.yourSchool")}
							{t("principal.subtitle", { count: campuses.length, location: locationWord })}
						</p>
					</div>
				</div>
			</div>

			<PrincipalSchoolPulse tenantName={activeTenant?.name ?? null} enabled={metricsEnabled} />

			<div className="border-dashboard-border border-t">
				<div className="px-4 pt-4 pb-2 sm:px-6 lg:px-8">
					<h2 className="font-medium text-dashboard-text-secondary text-sm">
						{t("principal.enrollmentDetail")}
					</h2>
				</div>
				<AdminDashboard enabled={metricsEnabled} embedded />
			</div>
		</div>
	);
}
