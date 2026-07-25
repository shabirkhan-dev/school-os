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
import { EmptyState } from "@school-os/ui/components/empty-state";
import { motion, useReducedMotion } from "motion/react";
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

	const noResultsLead = searchQuery
		? `Nothing matches “${searchQuery}”`
		: "Nothing matches your filters";
	const noResultsScope = filterLabel ? ` under the “${filterLabel}” filter` : "";
	const noResultsDescription = `${noResultsLead}${noResultsScope}. Try a different name, subject code, or campus.`;

	return (
		<motion.div
			initial={reducedMotion ? false : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
		>
			{variant === "no-sections" ? (
				<EmptyState
					icon={<HugeiconsIcon icon={School01Icon} size={26} strokeWidth={1.8} />}
					iconClassName="bg-dashboard-accent-soft text-dashboard-accent"
					title="Your classroom is waiting"
					description="No homeroom or subject classes are assigned to you in this organization yet. Ask an administrator to add you as a homeroom teacher or subject instructor — your sections will appear here the moment they do."
					footer={FLOW_ITEMS.map((item) => (
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
					className={cn(
						"rounded-[14px] border-dashboard-border-strong bg-dashboard-card-inner",
						className,
					)}
				/>
			) : (
				<EmptyState
					icon={<HugeiconsIcon icon={Search01Icon} size={24} strokeWidth={1.8} />}
					title="No matching classes"
					description={noResultsDescription}
					action={
						onClearFilters ? (
							<Button variant="outline" size="sm" onClick={onClearFilters}>
								<HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" strokeWidth={2} />
								Clear search &amp; filters
							</Button>
						) : null
					}
					className={cn(
						"rounded-[14px] border-dashboard-border-strong bg-dashboard-card-inner",
						className,
					)}
				/>
			)}
		</motion.div>
	);
}
