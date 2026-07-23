"use client";

import { Spinner } from "@school-os/ui/components/spinner";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { useTenantContext } from "../context/tenant-context";

const ONBOARDING_PREFIX = "/admin/onboarding";

export function TenantOnboardingGate({ children }: { children: ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { tenants, tenantsLoading, campuses, campusesLoading, activeTenant } = useTenantContext();

	const onOnboarding = pathname.startsWith(ONBOARDING_PREFIX);
	const onCampuses = pathname.includes("/campuses") || pathname.startsWith("/admin/tenants/");

	useEffect(() => {
		if (tenantsLoading) return;

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
		}
	}, [activeTenant?.id, onCampuses, onOnboarding, router, tenants, tenantsLoading]);

	useEffect(() => {
		if (tenantsLoading || campusesLoading || onOnboarding || onCampuses) return;
		if (tenants.length > 0 && campuses.length === 0 && activeTenant) {
			router.replace(`/admin/tenants/${activeTenant.id}/campuses`);
		}
	}, [
		activeTenant,
		campuses.length,
		campusesLoading,
		onCampuses,
		onOnboarding,
		router,
		tenants.length,
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
