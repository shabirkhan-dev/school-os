"use client";

import { cn } from "@/lib/utils";
import type { DashboardStatCard } from "@/modules/dashboard";
import { useDashboardT } from "@/modules/dashboard";
import { StatCard } from "./stat-card";

type Props = {
	stats: DashboardStatCard[];
	className?: string;
};

export function StatCardsRow({ stats, className }: Props) {
	const t = useDashboardT();
	return (
		<section
			aria-label={t("stats.aria")}
			className={cn(
				"grid grid-cols-1 gap-px overflow-hidden rounded-[16px] border border-dashboard-border bg-dashboard-border shadow-(--dashboard-shadow-card) sm:grid-cols-2 xl:grid-cols-4",
				className,
			)}
		>
			{stats.map((stat) => (
				<StatCard
					key={stat.id}
					label={stat.label}
					value={stat.value}
					formatValue={stat.formatValue}
					detail={stat.detail}
					trend={stat.trend}
					trendDelta={stat.trendDelta}
					trendLabel={stat.trendLabel}
					bars={stat.bars}
					activeIndex={stat.activeIndex}
					unavailable={stat.unavailable}
				/>
			))}
		</section>
	);
}
