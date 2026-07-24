"use client";

import { cn } from "@/lib/utils";
import type { DashboardOpsPulseItem } from "@/modules/dashboard";
import { useDashboardT } from "@/modules/dashboard";

type Props = {
	items: DashboardOpsPulseItem[];
	className?: string;
};

/**
 * Quiet operational depth under the greeting — same idea as chat's
 * title + description + status line, without adding another card.
 */
export function OpsPulseStrip({ items, className }: Props) {
	const t = useDashboardT();
	return (
		<section
			aria-label={t("opsPulse.aria")}
			className={cn(
				"grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-dashboard-border bg-dashboard-border sm:grid-cols-4",
				className,
			)}
		>
			{items.map((item) => (
				<div
					key={item.id}
					className="bg-dashboard-surface px-3 py-2.5 transition-colors hover:bg-dashboard-surface-hover sm:px-3.5 sm:py-3"
				>
					<div className="font-medium text-[10.5px] text-dashboard-text-muted uppercase tracking-[0.06em]">
						{item.label}
					</div>
					<div className="mt-1.5 font-semibold text-[17px] text-dashboard-text-primary leading-none tracking-tight tabular-nums sm:text-[18px]">
						{item.value}
					</div>
					<p className="mt-1.5 line-clamp-2 text-[11px] text-dashboard-text-dim leading-4 sm:text-[11.5px]">
						{item.hint}
					</p>
				</div>
			))}
		</section>
	);
}
