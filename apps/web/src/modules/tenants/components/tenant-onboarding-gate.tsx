"use client";

import { Spinner } from "@school-os/ui/components/spinner";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";

const ONBOARDING_PREFIX = "/admin/onboarding";

export function TenantOnboardingGate({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { tenants, tenantsLoading, campuses, campusesLoading, activeTenant } = useTenantContext();
	const { can } = usePermissions();
	const canCreateCampus = can(PermissionCodes.TENANT_CAMPUS_CREATE);

	const onOnboarding = pathname.startsWith(ONBOARDING_PREFIX);
	const onCampuses = pathname.includes("/campuses") || pathname.startsWith("/admin/tenants/");

	useEffect(() => {
		if (tenantsLoading || campusesLoading) return;

		if (tenants.length === 0 && !onOnboarding && !onCampuses) {
			router.replace("/admin/onboarding/tenant");
			return;
		}

		if (tenants.length > 0 && onOnboarding) {
			const tenantId = activeTenant?.id ?? tenants[0]?.id;
			if (tenantId) {
				router.replace(`/admin/tenants/${tenantId}/campuses`);
			} else {
				router.replace("/admin");
			}
			return;
		}

		if (
			!onOnboarding &&
			!onCampuses &&
			tenants.length > 0 &&
			campuses.length === 0 &&
			activeTenant &&
			canCreateCampus
		) {
			router.replace(`/admin/tenants/${activeTenant.id}/campuses`);
		}
	}, [
		activeTenant,
		campuses.length,
		campusesLoading,
		canCreateCampus,
		onCampuses,
		onOnboarding,
		router,
		tenants,
		tenantsLoading,
	]);

	if (tenantsLoading) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center">
				<Spinner className="size-6 text-dashboard-accent" />
			</div>
		);
	}

	if (tenants.length === 0 && !onOnboarding && !onCampuses) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center">
				<Spinner className="size-6 text-dashboard-accent" />
			</div>
		);
	}

	return children;
}
