"use client";

import { ArrowDown01Icon, ArrowUp01Icon, ShieldIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	type MembershipRole,
	membershipRoleDescriptions,
	membershipRoleLabels,
} from "@/modules/tenants";

const ROLES: MembershipRole[] = ["owner", "principal", "admin", "teacher", "parent", "student"];

const CAPABILITIES: Array<{ label: string; roles: MembershipRole[] }> = [
	{ label: "Manage organization settings", roles: ["owner", "principal", "admin"] },
	{ label: "Invite & manage members", roles: ["owner", "principal", "admin"] },
	{ label: "Manage campuses & academics", roles: ["owner", "principal", "admin"] },
	{ label: "Mark attendance & view students", roles: ["owner", "principal", "admin", "teacher"] },
	{ label: "Parent portal access", roles: ["parent"] },
	{ label: "Student portal access", roles: ["student"] },
];

type Props = {
	className?: string;
	defaultOpen?: boolean;
};

export function RoleAccessPanel({ className, defaultOpen = false }: Props) {
	const [open, setOpen] = useState(defaultOpen);

	return (
		<section
			className={cn(
				"overflow-hidden rounded-[14px] border border-dashboard-border bg-dashboard-surface",
				className,
			)}
		>
			<Button
				type="button"
				variant="ghost"
				onClick={() => setOpen((value) => !value)}
				aria-expanded={open}
				className="h-auto w-full justify-between gap-3 rounded-none px-3 py-3 text-start sm:px-4 sm:py-3.5"
			>
				<div className="flex items-center gap-2">
					<HugeiconsIcon
						icon={ShieldIcon}
						size={16}
						strokeWidth={2}
						className="text-dashboard-accent"
					/>
					<div>
						<div className="font-medium text-[11px] text-dashboard-text-muted uppercase tracking-[0.06em]">
							Role & access guide
						</div>
						<p className="mt-0.5 text-[12.5px] text-dashboard-text-secondary">
							Who can do what in your organization
						</p>
					</div>
				</div>
				<HugeiconsIcon
					icon={open ? ArrowUp01Icon : ArrowDown01Icon}
					size={16}
					strokeWidth={2}
					className="shrink-0 text-dashboard-text-muted"
				/>
			</Button>

			{open ? (
				<div className="border-dashboard-border border-t px-3 pb-3 sm:px-4 sm:pb-4">
					<div className="mt-3 overflow-x-auto">
						<table className="w-full min-w-[520px] text-[12px]">
							<thead>
								<tr className="text-left text-[10.5px] text-dashboard-text-dim uppercase tracking-[0.05em]">
									<th className="pb-2 pr-3 font-medium">Capability</th>
									{ROLES.map((role) => (
										<th key={role} className="pb-2 px-1 text-center font-medium">
											{membershipRoleLabels[role]}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{CAPABILITIES.map((row) => (
									<tr key={row.label} className="border-dashboard-border-subtle border-t">
										<td className="py-2 pr-3 text-dashboard-text-secondary">{row.label}</td>
										{ROLES.map((role) => (
											<td key={role} className="py-2 px-1 text-center">
												{row.roles.includes(role) ? (
													<span className="inline-block size-2 rounded-full bg-emerald-500" />
												) : (
													<span className="inline-block size-2 rounded-full bg-dashboard-border" />
												)}
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="mt-4 grid gap-2 sm:grid-cols-2">
						{ROLES.map((role) => (
							<div
								key={role}
								className="rounded-lg border border-dashboard-border-subtle bg-dashboard-surface-elevated px-3 py-2"
							>
								<div className="font-medium text-[12px] text-dashboard-text-primary">
									{membershipRoleLabels[role]}
								</div>
								<p className="mt-0.5 text-[11.5px] text-dashboard-text-dim leading-4">
									{membershipRoleDescriptions[role]}
								</p>
							</div>
						))}
					</div>
				</div>
			) : null}
		</section>
	);
}
