"use client";

import { RefreshIcon, Search02Icon, StudentIcon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { EmptyState } from "@school-os/ui/components/empty-state";
import { motion, useReducedMotion } from "motion/react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type Props = {
	/** "no-students" = roster is empty; "no-results" = search/filters matched nothing. */
	variant: "no-students" | "no-results";
	searchQuery?: string;
	statusLabel?: string;
	/** Hide the "Admit student" CTA when the viewer cannot write students. */
	canAdmit?: boolean;
	onAdmit?: () => void;
	onClearFilters?: () => void;
	className?: string;
};

export function StudentsEmptyState({
	variant,
	searchQuery,
	statusLabel,
	canAdmit = false,
	onAdmit,
	onClearFilters,
	className,
}: Props) {
	const reducedMotion = useReducedMotion();

	const noResultsLead = searchQuery ? `Nothing matches “${searchQuery}”` : "Nothing matches";
	const noResultsScope = statusLabel ? ` under the “${statusLabel}” status filter` : "";

	return (
		<motion.div
			initial={reducedMotion ? false : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: EASE_OUT }}
		>
			{variant === "no-students" ? (
				<EmptyState
					icon={<HugeiconsIcon icon={StudentIcon} size={26} strokeWidth={1.8} />}
					iconClassName="bg-dashboard-accent-soft text-dashboard-accent"
					title="No students yet"
					description="Admit your first student to start building the campus roster — profiles, ID cards, and enrollments all live here."
					action={
						canAdmit && onAdmit ? (
							<Button type="button" size="sm" onClick={onAdmit}>
								<HugeiconsIcon icon={UserAdd01Icon} data-icon="inline-start" strokeWidth={2} />
								Admit student
							</Button>
						) : null
					}
					className={cn(
						"rounded-[14px] border-dashboard-border-strong bg-dashboard-card-inner",
						className,
					)}
				/>
			) : (
				<EmptyState
					icon={<HugeiconsIcon icon={Search02Icon} size={24} strokeWidth={1.8} />}
					title="No matching students"
					description={`${noResultsLead}${noResultsScope}. Try a different name, student code, phone number, or section.`}
					action={
						onClearFilters ? (
							<Button type="button" variant="outline" size="sm" onClick={onClearFilters}>
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
