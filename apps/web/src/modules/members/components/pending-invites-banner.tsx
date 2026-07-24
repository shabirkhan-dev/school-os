"use client";

import { Mail01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription, AlertTitle } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import Link from "next/link";
import { membershipRoleLabels } from "@/modules/tenants";
import { usePendingInvitesQuery } from "../hooks/use-member-queries";

export function PendingInvitesBanner() {
	const pendingQuery = usePendingInvitesQuery();
	const invites = pendingQuery.data?.invites ?? [];

	if (pendingQuery.isLoading || invites.length === 0) return null;

	const first = invites[0];

	return (
		<Alert className="mx-3 mt-2 border-dashboard-accent/30 bg-dashboard-accent-soft/40 sm:mx-6">
			<HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
			<AlertTitle>
				{invites.length === 1 ? "Organization invite waiting" : `${invites.length} invites waiting`}
			</AlertTitle>
			<AlertDescription className="flex flex-wrap items-center justify-between gap-3">
				<span className="min-w-0 truncate">
					Join {first?.tenantName} as {first ? membershipRoleLabels[first.role] : "member"}
					{invites.length > 1 ? ` · +${invites.length - 1} more` : ""}
				</span>
				<Button
					size="sm"
					className="shrink-0"
					render={<Link href="/accept-invite" />}
					nativeButton={false}
				>
					Review invites
				</Button>
			</AlertDescription>
		</Alert>
	);
}
