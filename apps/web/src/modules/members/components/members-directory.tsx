"use client";

import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@school-os/ui/components/dropdown-menu";
import { Skeleton } from "@school-os/ui/components/skeleton";
import { cn } from "@/lib/utils";
import { membershipRoleLabels } from "@/modules/tenants";
import type { ActorCapabilities, Member } from "../types/member.types";
import { formatInviteExpiry, formatJoinedDate, memberInitials } from "../utils/member-ui.utils";
import { MemberRoleBadge, MemberStatusBadge } from "./member-badges";

type Props = {
	members: Member[];
	loading?: boolean;
	actor: ActorCapabilities | undefined;
	currentMembershipId: string | null;
	onSelect: (member: Member) => void;
	onResendInvite?: (inviteId: string, email: string) => void;
	className?: string;
};

export function MembersDirectory({
	members,
	loading,
	actor,
	currentMembershipId,
	onSelect,
	onResendInvite,
	className,
}: Props) {
	if (loading) {
		return (
			<div className={cn("space-y-3 px-4 py-4", className)}>
				{["s1", "s2", "s3", "s4", "s5"].map((key) => (
					<div key={key} className="flex gap-3">
						<Skeleton className="size-10 rounded-xl" />
						<div className="flex-1 space-y-2">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-3 w-56" />
						</div>
					</div>
				))}
			</div>
		);
	}

	if (members.length === 0) {
		return (
			<div className={cn("px-4 py-12 text-center", className)}>
				<p className="font-medium text-[14px] text-dashboard-text-primary">No matching members</p>
				<p className="mx-auto mt-1 max-w-sm text-[12.5px] text-dashboard-text-muted leading-5">
					Try clearing filters or invite someone new to your organization.
				</p>
			</div>
		);
	}

	return (
		<div className={cn("min-w-0", className)}>
			<ul className="divide-y divide-dashboard-border-subtle md:hidden">
				{members.map((member) => (
					<li key={member.id}>
						<MemberMobileRow
							member={member}
							isSelf={member.id === currentMembershipId}
							onSelect={onSelect}
							onResendInvite={onResendInvite}
						/>
					</li>
				))}
			</ul>

			<div className="hidden min-w-0 overflow-x-auto overscroll-x-contain md:block">
				<table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-[13px]">
					<colgroup>
						<col style={{ width: "36%" }} />
						<col style={{ width: "14%" }} />
						<col style={{ width: "14%" }} />
						<col style={{ width: "12%" }} />
						<col style={{ width: "14%" }} />
						<col style={{ width: "52px" }} />
					</colgroup>
					<thead>
						<tr className="text-left">
							{["Member", "Role", "Campus", "Status", "Joined", ""].map((label) => (
								<th
									key={label || "actions"}
									className="py-2.5 pr-3 font-medium text-[11px] text-dashboard-text-muted uppercase tracking-[0.06em] first:pl-4 last:pr-3"
								>
									{label ? label : <span className="sr-only">Actions</span>}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{members.map((member, index) => (
							<tr
								key={member.id}
								className={cn(
									"group/row transition-colors hover:bg-dashboard-hover",
									index > 0 && "border-dashboard-border-subtle [&>td]:border-t",
								)}
							>
								<td className="py-3 pr-3 pl-4 align-top">
									<button
										type="button"
										className="w-full cursor-pointer text-start"
										onClick={() => onSelect(member)}
									>
										<MemberIdentity member={member} isSelf={member.id === currentMembershipId} />
									</button>
								</td>
								<td className="py-3 pr-3 align-top">
									<button type="button" className="cursor-pointer" onClick={() => onSelect(member)}>
										<MemberRoleBadge role={member.role} />
									</button>
								</td>
								<td className="py-3 pr-3 align-top">
									<button
										type="button"
										className="block w-full cursor-pointer truncate text-start text-[12.5px] text-dashboard-text-primary"
										onClick={() => onSelect(member)}
									>
										{member.campusName ?? "All campuses"}
									</button>
								</td>
								<td className="py-3 pr-3 align-top">
									<button type="button" className="cursor-pointer" onClick={() => onSelect(member)}>
										<MemberStatusBadge status={member.status} />
									</button>
								</td>
								<td className="py-3 pr-3 align-top tabular-nums">
									<button
										type="button"
										className="cursor-pointer text-[12.5px] text-dashboard-text-secondary"
										onClick={() => onSelect(member)}
									>
										{formatJoinedDate(member.createdAt)}
									</button>
								</td>
								<td className="py-3 pr-3 align-top">
									<MemberRowMenu
										member={member}
										canResend={Boolean(actor?.canInvite && member.pendingInviteId)}
										onOpen={() => onSelect(member)}
										onResendInvite={onResendInvite}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function MemberIdentity({ member, isSelf }: { member: Member; isSelf: boolean }) {
	return (
		<div className="flex min-w-0 items-start gap-2.5">
			<span
				aria-hidden
				className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-dashboard-surface-strong font-semibold text-[11px] text-dashboard-text-secondary ring-1 ring-dashboard-border"
			>
				{memberInitials(member)}
			</span>
			<span className="min-w-0">
				<span className="flex items-center gap-1.5">
					<span className="block truncate font-semibold text-[13px] text-dashboard-text-primary">
						{member.username}
					</span>
					{isSelf ? (
						<span className="rounded-md bg-dashboard-accent-soft px-1.5 py-0.5 text-[10px] text-dashboard-accent uppercase tracking-wide">
							You
						</span>
					) : null}
				</span>
				<span className="mt-0.5 block truncate text-[12px] text-dashboard-text-muted">
					{member.email}
				</span>
				{member.inviteExpiresAt ? (
					<span className="mt-0.5 block truncate text-[11px] text-amber-700 dark:text-amber-300">
						{formatInviteExpiry(member.inviteExpiresAt)}
					</span>
				) : null}
			</span>
		</div>
	);
}

function MemberMobileRow({
	member,
	isSelf,
	onSelect,
	onResendInvite,
}: {
	member: Member;
	isSelf: boolean;
	onSelect: (member: Member) => void;
	onResendInvite?: (inviteId: string, email: string) => void;
}) {
	return (
		<button
			type="button"
			className="flex w-full gap-3 px-4 py-3.5 text-start transition-colors hover:bg-dashboard-hover"
			onClick={() => onSelect(member)}
		>
			<span
				aria-hidden
				className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-dashboard-surface-strong font-semibold text-[12px] text-dashboard-text-secondary ring-1 ring-dashboard-border"
			>
				{memberInitials(member)}
			</span>
			<div className="min-w-0 flex-1 space-y-2">
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0">
						<p className="truncate font-semibold text-[14px] text-dashboard-text-primary">
							{member.username}
							{isSelf ? " · You" : ""}
						</p>
						<p className="mt-0.5 truncate text-[12px] text-dashboard-text-muted">{member.email}</p>
					</div>
					<MemberStatusBadge status={member.status} className="shrink-0" />
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<MemberRoleBadge role={member.role} />
					<span className="text-[11.5px] text-dashboard-text-dim">
						{member.campusName ?? "All campuses"}
					</span>
				</div>
				{member.pendingInviteId && onResendInvite ? (
					<button
						type="button"
						className="inline-block text-[11.5px] text-dashboard-accent underline-offset-2 hover:underline"
						onClick={(e) => {
							e.stopPropagation();
							onResendInvite(member.pendingInviteId as string, member.email);
						}}
					>
						Resend invite
					</button>
				) : null}
			</div>
		</button>
	);
}

function MemberRowMenu({
	member,
	canResend,
	onOpen,
	onResendInvite,
}: {
	member: Member;
	canResend: boolean;
	onOpen: () => void;
	onResendInvite?: (inviteId: string, email: string) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="outline" size="icon-sm" aria-label={`Actions for ${member.username}`} />
				}
			>
				<HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={onOpen}>View & edit</DropdownMenuItem>
				{canResend && onResendInvite ? (
					<DropdownMenuItem
						onClick={() => onResendInvite(member.pendingInviteId as string, member.email)}
					>
						Resend invite
					</DropdownMenuItem>
				) : null}
				<DropdownMenuItem disabled>{membershipRoleLabels[member.role]}</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
