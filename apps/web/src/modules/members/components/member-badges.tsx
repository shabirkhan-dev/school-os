"use client";

import {
	AlertCircleIcon,
	CheckmarkCircle02Icon,
	Mail01Icon,
	UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@school-os/ui/components/badge";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { type MembershipRole, membershipRoleLabels } from "@/modules/tenants";
import type { MemberStatus } from "../types/member.types";
import { formatMemberStatus } from "../utils/member-ui.utils";

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

const STATUS_ICONS: Record<MemberStatus, IconType> = {
	active: CheckmarkCircle02Icon,
	invited: Mail01Icon,
	suspended: UserRemove01Icon,
};

const STATUS_VARIANT: Record<MemberStatus, "secondary" | "outline" | "destructive"> = {
	active: "secondary",
	invited: "outline",
	suspended: "destructive",
};

export function MemberStatusBadge({
	status,
	className,
	showIcon = true,
}: {
	status: MemberStatus;
	className?: string;
	showIcon?: boolean;
}) {
	return (
		<Badge variant={STATUS_VARIANT[status]} className={cn("gap-1 text-[11px]", className)}>
			{showIcon ? (
				<HugeiconsIcon icon={STATUS_ICONS[status]} data-icon="inline-start" strokeWidth={2} />
			) : null}
			{formatMemberStatus(status)}
		</Badge>
	);
}

export function MemberRoleBadge({ role, className }: { role: MembershipRole; className?: string }) {
	return (
		<Badge variant="outline" className={cn("text-[11px]", className)}>
			{membershipRoleLabels[role]}
		</Badge>
	);
}

export function MemberVerifiedBadge({ verified }: { verified: boolean }) {
	if (verified) return null;
	return (
		<Badge
			variant="outline"
			className="gap-1 border-destructive/25 bg-destructive/10 text-[10px] text-destructive"
		>
			<HugeiconsIcon icon={AlertCircleIcon} data-icon="inline-start" strokeWidth={2} />
			Unverified email
		</Badge>
	);
}
