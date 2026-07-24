"use client";

import { ArrowDown01Icon, ArrowRight01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { DashboardForwardIcon } from "@/modules/dashboard";
import { MiniBars } from "./mini-bars";
import { useCountUp } from "./use-count-up";

export type Trend = "up" | "down" | "flat";

type Props = {
	label: string;
	value: number;
	formatValue: (n: number) => string;
	detail?: string;
	trendLabel?: string;
	trendDelta?: string;
	trend?: Trend;
	bars: number[];
	activeIndex?: number;
	unavailable?: boolean;
	className?: string;
};

const trendSpec: Record<Trend, { icon: typeof ArrowUp01Icon; chip: string; delta: string }> = {
	up: {
		icon: ArrowUp01Icon,
		chip: "bg-primary/10 text-primary",
		delta: "text-primary",
	},
	down: {
		icon: ArrowDown01Icon,
		chip: "bg-destructive/10 text-destructive",
		delta: "text-destructive",
	},
	flat: {
		icon: ArrowRight01Icon,
		chip: "bg-dashboard-hover text-dashboard-text-muted",
		delta: "text-dashboard-text-muted",
	},
};

export function StatCard({
	label,
	value,
	formatValue,
	detail,
	trendLabel = "vs last term",
	trendDelta = "+0.0%",
	trend = "up",
	bars,
	activeIndex,
	unavailable = false,
	className,
}: Props) {
	const animated = useCountUp(unavailable ? 0 : value);
	const spec = trendSpec[trend];

	return (
		<div
			className={cn(
				"relative min-h-[140px] bg-dashboard-card-inner p-3.5 transition-colors duration-200 hover:bg-dashboard-surface-hover sm:min-h-[158px] sm:p-4",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-3 sm:gap-4">
				<div className="min-w-0">
					<div className="font-medium text-[11px] text-dashboard-text-muted uppercase tracking-[0.06em]">
						{label}
					</div>
					<div className="mt-2.5 flex items-baseline gap-2 sm:mt-3">
						<span className="font-semibold text-[24px] text-dashboard-text-primary leading-none tracking-tight tabular-nums sm:text-[26px]">
							{unavailable ? formatValue(value) : formatValue(animated)}
						</span>
					</div>
					{detail ? (
						<p className="mt-2 max-w-[200px] text-[12px] text-dashboard-text-dim leading-4">
							{detail}
						</p>
					) : null}
				</div>
				<MiniBars data={bars} activeIndex={activeIndex} className="mt-1 shrink-0" />
			</div>

			<div className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-dashboard-text-muted tabular-nums sm:mt-4">
				<span className={cn("flex size-5 items-center justify-center rounded-md", spec.chip)}>
					{trend === "flat" ? (
						<DashboardForwardIcon icon={spec.icon} size={13} strokeWidth={2.2} />
					) : (
						<HugeiconsIcon icon={spec.icon} size={13} strokeWidth={2.2} />
					)}
				</span>
				<span className={cn("font-semibold", spec.delta)}>{trendDelta}</span>
				<span>{trendLabel}</span>
			</div>
		</div>
	);
}
