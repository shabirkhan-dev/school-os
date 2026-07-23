"use client";

import { cn } from "@/lib/utils";
import type { MemberInsights } from "../utils/member-ui.utils";

type Props = {
	insights: MemberInsights;
	loading?: boolean;
	className?: string;
};

const ITEMS: Array<{
	key: keyof MemberInsights["hints"];
	label: string;
	value: (i: MemberInsights) => string | number;
}> = [
	{ key: "total", label: "Team size", value: (i) => i.total },
	{ key: "active", label: "Active now", value: (i) => i.active },
	{ key: "leadership", label: "Leadership", value: (i) => i.leadership },
	{ key: "awaiting", label: "Awaiting join", value: (i) => i.awaiting },
];

export function MembersInsightsStrip({ insights, loading, className }: Props) {
	return (
		<section
			aria-label="Team insights"
			className={cn(
				"grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-dashboard-border bg-dashboard-border lg:grid-cols-4",
				className,
			)}
		>
			{ITEMS.map((item) => (
				<div
					key={item.key}
					className="bg-dashboard-surface px-3 py-2.5 transition-colors hover:bg-dashboard-surface-hover sm:px-3.5 sm:py-3"
				>
					<div className="font-medium text-[10.5px] text-dashboard-text-muted uppercase tracking-[0.06em]">
						{item.label}
					</div>
					<div className="mt-1.5 font-semibold text-[17px] text-dashboard-text-primary leading-none tracking-tight tabular-nums sm:text-[18px]">
						{loading ? "—" : item.value(insights)}
					</div>
					<p className="mt-1.5 line-clamp-2 text-[11px] text-dashboard-text-dim leading-4 sm:text-[11.5px]">
						{loading ? "Loading team data…" : insights.hints[item.key]}
					</p>
				</div>
			))}
		</section>
	);
}
