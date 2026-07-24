"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

type Props = {
	icon: IconSvgElement;
	size?: number;
	strokeWidth?: number;
	className?: string;
};

/** Chevron / arrow that points “forward” in both LTR and RTL (admin shell). */
export function DashboardForwardIcon({ icon, size = 14, strokeWidth = 2, className }: Props) {
	return (
		<HugeiconsIcon
			icon={icon}
			size={size}
			strokeWidth={strokeWidth}
			className={cn("shrink-0 rtl:rotate-180", className)}
		/>
	);
}
