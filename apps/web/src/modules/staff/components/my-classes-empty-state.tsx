"use client";

import {
	BookOpen02Icon,
	Calendar03Icon,
	CheckmarkCircle02Icon,
	RefreshIcon,
	School01Icon,
	Search01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
	/** "no-sections" = teacher has no assignments yet; "no-results" = filters matched nothing. */
	variant: "no-sections" | "no-results";
	searchQuery?: string;
	filterLabel?: string;
	onClearFilters?: () => void;
	className?: string;
};

const FLOW_ITEMS: Array<{ icon: typeof Calendar03Icon; text: string }> = [
	{ icon: Calendar03Icon, text: "Mark attendance" },
	{ icon: BookOpen02Icon, text: "Assign homework" },
	{ icon: CheckmarkCircle02Icon, text: "Schedule tests" },
];

export function MyClassesEmptyState({
	variant,
	searchQuery,
	filterLabel,
	onClearFilters,
	className,
}: Props) {
	const reducedMotion = useReducedMotion();

	const iconTile = (icon: ReactNode, tone: "accent" | "muted") => (
		<div
			className={cn(
				"mx-auto flex size-14 items-center justify-center rounded-2xl",
				tone === "accent"
					? "bg-dashboard-accent-soft text-dashboard-accent"
					: "bg-muted text-muted-foreground",
			)}
		>
			{icon}
		</div>
	);

	return (
		<motion.div
			initial={reducedMotion ? false : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
			className={cn(
				"rounded-[14px] border border-dashed border-dashboard-border-strong bg-dashboard-card-inner px-6 py-14 text-center",
				className,
			)}
		>
			{variant === "no-sections" ? (
				<>
					{iconTile(<HugeiconsIcon icon={School01Icon} size={26} strokeWidth={1.8} />, "accent")}
					<h3 className="mt-5 font-semibold text-[17px] text-dashboard-text-primary tracking-tight">
						Your classroom is waiting
					</h3>
					<p className="mx-auto mt-2 max-w-md text-[13px] text-muted-foreground leading-relaxed">
						No homeroom or subject classes are assigned to you in this organization yet. Ask an
						administrator to add you as a homeroom teacher or subject instructor — your sections
						will appear here the moment they do.
					</p>
					<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
						{FLOW_ITEMS.map((item) => (
							<span
								key={item.text}
								className="flex items-center gap-1.5 rounded-full border border-dashboard-border bg-dashboard-card-outer px-3 py-1.5 text-[12px] font-medium text-dashboard-text-secondary"
							>
								<HugeiconsIcon
									icon={item.icon}
									size={14}
									strokeWidth={2}
									className="text-dashboard-accent"
								/>
								{item.text}
							</span>
						))}
					</div>
				</>
			) : (
				<>
					{iconTile(<HugeiconsIcon icon={Search01Icon} size={24} strokeWidth={1.8} />, "muted")}
					<h3 className="mt-5 font-semibold text-[16px] text-dashboard-text-primary tracking-tight">
						No matching classes
					</h3>
					<p className="mx-auto mt-2 max-w-md text-[13px] text-muted-foreground leading-relaxed">
						Nothing matches
						{searchQuery ? (
							<>
								{" "}
								<span className="font-medium text-foreground">“{searchQuery}”</span>
							</>
						) : null}
						{filterLabel ? <> under the “{filterLabel}” filter</> : null}. Try a different name,
						subject code, or campus.
					</p>
					{onClearFilters ? (
						<Button variant="outline" size="sm" className="mt-5" onClick={onClearFilters}>
							<HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" strokeWidth={2} />
							Clear search &amp; filters
						</Button>
					) : null}
				</>
			)}
		</motion.div>
	);
}
