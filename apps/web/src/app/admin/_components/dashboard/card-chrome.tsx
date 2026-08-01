"use client";

import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@school-os/ui/components/tooltip";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeaderProps = {
	title: string;
	description?: string;
	meta?: string;
	info?: string;
	actions?: ReactNode;
	className?: string;
};

/** Chat-style title block: strong label + quiet description + optional meta. */
export function DashboardCardHeader({
	title,
	description,
	meta,
	info,
	actions,
	className,
}: HeaderProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-3 border-dashboard-border border-b px-3 py-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-3 sm:px-4 sm:py-3.5",
				className,
			)}
		>
			<div className="min-w-0 space-y-1">
				<div className="flex items-center gap-1.5">
					<h2 className="font-medium text-[11px] text-dashboard-text-muted uppercase tracking-[0.06em]">
						{title}
					</h2>
					{info ? (
						<Tooltip>
							<TooltipTrigger
								render={
									<Button
										variant="ghost"
										size="icon"
										aria-label={`About ${title}`}
										className="size-auto rounded-md p-0 text-dashboard-text-faint hover:bg-transparent hover:text-dashboard-text-muted"
									/>
								}
							>
								<HugeiconsIcon icon={InformationCircleIcon} size={13} strokeWidth={1.8} />
							</TooltipTrigger>
							<TooltipContent side="top" className="max-w-[240px]">
								{info}
							</TooltipContent>
						</Tooltip>
					) : null}
				</div>
				{description ? (
					<p className="hidden max-w-xl text-[12.5px] text-dashboard-text-secondary leading-4 sm:block">
						{description}
					</p>
				) : null}
				{meta ? <p className="text-[11px] text-dashboard-text-dim tabular-nums">{meta}</p> : null}
			</div>
			{actions ? (
				<div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
					{actions}
				</div>
			) : null}
		</div>
	);
}

type FooterProps = {
	children: ReactNode;
	action?: ReactNode;
	className?: string;
};

/** Composer-style footer rail: summary chips + one quiet action. */
export function DashboardCardFooter({ children, action, className }: FooterProps) {
	return (
		<div
			className={cn(
				"flex flex-col gap-2 border-dashboard-border border-t bg-dashboard-surface/60 px-3 py-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-4",
				className,
			)}
		>
			<div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-dashboard-text-muted">
				{children}
			</div>
			{action ? <div className="shrink-0">{action}</div> : null}
		</div>
	);
}

export function FooterSep() {
	return (
		<span className="text-dashboard-text-faint" aria-hidden>
			|
		</span>
	);
}

type InsightProps = {
	label: string;
	value: string;
	hint?: string;
	className?: string;
};

/** Compact insight tile used beside chart headlines. */
export function InsightStat({ label, value, hint, className }: InsightProps) {
	return (
		<div className={cn("min-w-0", className)}>
			<div className="text-[11px] text-dashboard-text-muted uppercase tracking-[0.05em]">
				{label}
			</div>
			<div className="mt-1 font-semibold text-[22px] text-dashboard-text-primary leading-none tracking-tight tabular-nums sm:text-[26px]">
				{value}
			</div>
			{hint ? <p className="mt-1.5 text-[12px] text-dashboard-text-dim leading-4">{hint}</p> : null}
		</div>
	);
}
