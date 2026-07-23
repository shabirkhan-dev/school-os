"use client";

import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
	CampusCreateForm,
	CampusList,
	membershipRoleLabels,
	PermissionCodes,
	TenantSettingsForm,
	useCampusesQuery,
	usePermissions,
	useTenantContext,
	useTenantQuery,
} from "@/modules/tenants";

export default function TenantCampusesPage() {
	const params = useParams<{ tenantId: string }>();
	const router = useRouter();
	const tenantId = params.tenantId;
	const { setActiveTenantId, setActiveCampusId, activeCampus } = useTenantContext();
	const { can, role } = usePermissions();
	const tenantQuery = useTenantQuery(tenantId);
	const campusesQuery = useCampusesQuery(tenantId);

	const tenant = tenantQuery.data;
	const campuses = campusesQuery.data ?? [];
	const canManageSettings = can(PermissionCodes.TENANT_SETTINGS_WRITE);

	return (
		<div className="mx-auto w-full max-w-[1080px] space-y-6 px-3 py-6 sm:px-6 lg:px-8">
			<header className="flex flex-col gap-4 border-dashboard-border border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
				<div className="min-w-0">
					<p className="mb-1.5 text-[11px] text-dashboard-text-muted uppercase tracking-[0.06em]">
						Organization setup
					</p>
					<h1 className="font-semibold text-[24px] text-dashboard-text-primary leading-tight">
						{tenant?.name ?? "Campuses"}
					</h1>
					<p className="mt-1 max-w-2xl text-[13px] text-dashboard-text-muted">
						Manage campuses and organization settings for your school network.
						{role ? (
							<span className="mt-1 block text-dashboard-text-secondary">
								Signed in as {membershipRoleLabels[role]}.
							</span>
						) : null}
					</p>
				</div>
				{campuses.length > 0 ? (
					<Button render={<Link href="/admin" />} nativeButton={false}>
						Go to dashboard
						<HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.8} />
					</Button>
				) : null}
			</header>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
				<section className="min-w-0 space-y-6">
					<div className="space-y-3">
						<h2 className="font-medium text-[14px] text-dashboard-text-secondary">Your campuses</h2>
						<CampusList
							campuses={campuses}
							loading={campusesQuery.isLoading}
							activeCampusId={activeCampus?.id}
							onSelect={(campusId) => {
								setActiveTenantId(tenantId);
								setActiveCampusId(campusId);
							}}
						/>
					</div>

					{tenant && canManageSettings ? <TenantSettingsForm tenant={tenant} /> : null}
				</section>

				<CampusCreateForm
					tenantId={tenantId}
					onCreated={() => {
						setActiveTenantId(tenantId);
						if (campuses.length === 0) {
							void campusesQuery.refetch().then((result) => {
								const first = result.data?.[0];
								if (first) setActiveCampusId(first.id);
								router.push("/admin");
							});
						}
					}}
				/>
			</div>
		</div>
	);
}
