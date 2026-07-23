"use client";

import { StudentIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Spinner } from "@school-os/ui/components/spinner";
import { useTenantContext } from "@/modules/tenants";
import { useMyChildrenQuery } from "../hooks/use-guardian-queries";

export function MyChildrenPage() {
	const { activeTenant } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const query = useMyChildrenQuery(tenantId);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Switch to an organization to view linked children.</AlertDescription>
			</Alert>
		);
	}

	if (query.isLoading) {
		return (
			<div className="flex justify-center py-10">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
			<header className="mb-6 border-dashboard-border border-b pb-5">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={StudentIcon} size={20} strokeWidth={1.8} />
					</div>
					<div>
						<h1 className="font-semibold text-[24px] text-dashboard-text-primary">My children</h1>
						<p className="text-[13px] text-dashboard-text-muted">
							Students linked to your parent or guardian account.
						</p>
					</div>
				</div>
			</header>

			{(query.data ?? []).length === 0 ? (
				<Alert>
					<AlertDescription>
						No linked students yet. Ask your school admin to connect your guardian profile to your
						children, or request a parent role on your membership.
					</AlertDescription>
				</Alert>
			) : (
				<div className="grid gap-3 sm:grid-cols-2">
					{query.data?.map((child) => (
						<div
							key={child.studentId}
							className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4"
						>
							<div className="font-medium">{child.fullName}</div>
							<div className="mt-1 text-[12px] text-dashboard-text-muted">{child.studentCode}</div>
							<div className="mt-3 flex gap-2">
								<Badge variant="outline">{child.relationship}</Badge>
								{child.isPrimary ? <Badge>Primary</Badge> : null}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
