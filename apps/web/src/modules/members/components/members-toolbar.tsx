"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { SearchInput } from "@school-os/ui/components/search-input";
import { SelectField } from "@school-os/ui/components/select-field";
import { cn } from "@/lib/utils";
import { type MembershipRole, membershipRoleLabels } from "@/modules/tenants";
import type { MemberStatus } from "../types/member.types";

export type MembersFilters = {
	query: string;
	status: "all" | MemberStatus;
	role: "all" | MembershipRole;
	campusId: "all" | string;
};

type Props = {
	filters: MembersFilters;
	onFiltersChange: (patch: Partial<MembersFilters>) => void;
	campuses: Array<{ id: string; name: string }>;
	canInvite: boolean;
	onInvite: () => void;
	resultCount: number;
	totalCount: number;
	className?: string;
};

const STATUS_OPTIONS: Array<{ value: MembersFilters["status"]; label: string }> = [
	{ value: "all", label: "All status" },
	{ value: "active", label: "Active" },
	{ value: "invited", label: "Invited" },
	{ value: "suspended", label: "Suspended" },
];

const ROLE_OPTIONS: MembershipRole[] = [
	"owner",
	"principal",
	"admin",
	"teacher",
	"parent",
	"student",
];

const filterTriggerClassName = "w-full sm:w-auto sm:min-w-[7.5rem]";

export function MembersToolbar({
	filters,
	onFiltersChange,
	campuses,
	canInvite,
	onInvite,
	resultCount,
	totalCount,
	className,
}: Props) {
	return (
		<div
			className={cn(
				"flex flex-col gap-3 border-dashboard-border border-b px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4 sm:py-3.5",
				className,
			)}
		>
			<div className="min-w-0 space-y-1">
				<h2 className="font-medium text-[11px] text-dashboard-text-muted uppercase tracking-[0.06em]">
					Team directory
				</h2>
				<p className="text-[12.5px] text-dashboard-text-secondary tabular-nums">
					{resultCount} shown · {totalCount} total
				</p>
			</div>

			<div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
				<SearchInput
					value={filters.query}
					onValueChange={(query) => onFiltersChange({ query })}
					placeholder="Search people…"
					aria-label="Search members"
					className="min-w-0 flex-1 sm:w-[220px] sm:flex-none lg:w-[260px]"
				/>

				<SelectField
					aria-label="Filter by status"
					value={filters.status}
					onValueChange={(status) =>
						onFiltersChange({ status: status as MembersFilters["status"] })
					}
					items={STATUS_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value }))}
					size="sm"
					triggerClassName={filterTriggerClassName}
				/>

				<SelectField
					aria-label="Filter by role"
					value={filters.role}
					onValueChange={(role) => onFiltersChange({ role: role as MembersFilters["role"] })}
					items={[
						{ label: "All roles", value: "all" },
						...ROLE_OPTIONS.map((role) => ({
							label: membershipRoleLabels[role],
							value: role,
						})),
					]}
					size="sm"
					triggerClassName={filterTriggerClassName}
				/>

				{campuses.length > 0 ? (
					<SelectField
						aria-label="Filter by campus"
						value={filters.campusId}
						onValueChange={(campusId) => onFiltersChange({ campusId })}
						items={[
							{ label: "All campuses", value: "all" },
							...campuses.map((campus) => ({ label: campus.name, value: campus.id })),
						]}
						size="sm"
						triggerClassName={cn(filterTriggerClassName, "sm:max-w-[160px]")}
					/>
				) : null}

				{canInvite ? (
					<Button size="sm" className="h-9 shrink-0 gap-1.5" onClick={onInvite}>
						<HugeiconsIcon icon={Add01Icon} data-icon="inline-start" strokeWidth={2.4} />
						Invite member
					</Button>
				) : null}
			</div>
		</div>
	);
}
