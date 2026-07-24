"use client";

import { ArrowDown01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { cn } from "@/lib/utils";

type Props = {
	label: string;
	onClick?: () => void;
	className?: string;
};

export function DateRangePill({ label, onClick, className }: Props) {
	return (
		<Button
			variant="outline"
			size="sm"
			onClick={onClick}
			className={cn(
				"h-8 gap-2 rounded-full border-dashboard-border-strong bg-dashboard-surface px-3 text-[12.5px] text-dashboard-text-secondary hover:border-dashboard-border-focus hover:bg-dashboard-surface-elevated dark:border-dashboard-border-strong dark:bg-dashboard-surface dark:hover:border-dashboard-border-focus dark:hover:bg-dashboard-surface-elevated",
				className,
			)}
		>
			<HugeiconsIcon
				icon={Calendar03Icon}
				size={14}
				strokeWidth={1.8}
				className="text-dashboard-text-muted"
			/>
			<span className="max-w-[9rem] truncate font-medium sm:max-w-none">{label}</span>
			<HugeiconsIcon
				icon={ArrowDown01Icon}
				size={12}
				strokeWidth={2}
				className="text-dashboard-text-dim"
			/>
		</Button>
	);
}
