"use client";

import { AiMagicIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { cn } from "@/lib/utils";
import { DashboardForwardIcon } from "@/modules/dashboard";

type Props = {
	label?: string;
	onClick?: () => void;
	disabled?: boolean;
	title?: string;
	className?: string;
};

export function AiInsightButton({
	label = "Get AI insight for better analysis",
	onClick,
	disabled = false,
	title,
	className,
}: Props) {
	return (
		<Button
			variant="outline"
			onClick={onClick}
			disabled={disabled}
			title={title}
			className={cn(
				"group h-auto w-full items-center gap-3 rounded-none border-0 border-dashboard-border border-t bg-transparent px-0 pt-4 text-start font-normal hover:bg-transparent hover:text-dashboard-text-primary disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-inherit",
				className,
			)}
		>
			<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
				<HugeiconsIcon icon={AiMagicIcon} size={16} strokeWidth={1.8} />
			</span>
			<span className="flex-1 truncate text-[13px] text-dashboard-text-secondary">{label}</span>
			<span className="flex size-7 shrink-0 items-center justify-center text-dashboard-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-dashboard-text-primary rtl:group-hover:-translate-x-0.5">
				<DashboardForwardIcon icon={ArrowRight01Icon} size={15} strokeWidth={2} />
			</span>
		</Button>
	);
}
