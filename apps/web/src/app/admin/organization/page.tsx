"use client";

import { Spinner } from "@school-os/ui/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTenantContext } from "@/modules/tenants";

export default function OrganizationRedirectPage() {
	const router = useRouter();
	const { activeTenant, tenants, tenantsLoading } = useTenantContext();

	useEffect(() => {
		if (tenantsLoading) return;
		const tenantId = activeTenant?.id ?? tenants[0]?.id;
		if (tenantId) {
			router.replace(`/admin/tenants/${tenantId}/campuses`);
			return;
		}
		router.replace("/admin/onboarding/tenant");
	}, [activeTenant?.id, router, tenants, tenantsLoading]);

	return (
		<div className="flex min-h-[40vh] items-center justify-center">
			<Spinner className="size-6 text-dashboard-accent" />
		</div>
	);
}
