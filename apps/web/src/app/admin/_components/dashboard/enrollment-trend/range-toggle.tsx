"use client";

import { ToggleGroup, ToggleGroupItem } from "@school-os/ui/components/toggle-group";
import { cn } from "@/lib/utils";

export type Range = "Weekly" | "Monthly" | "Yearly";

const ranges: { value: Range; short: string }[] = [
	{ value: "Weekly", short: "Wk" },
	{ value: "Monthly", short: "Mo" },
	{ value: "Yearly", short: "Yr" },
];

type Props = {
	value?: Range;
	onChange?: (r: Range) => void;
	className?: string;
};

export function RangeToggle({ value = "Monthly", onChange, className }: Props) {
	return (
		<ToggleGroup
			value={[value]}
			onValueChange={(next) => {
				const selected = next[0] as Range | undefined;
				if (selected) onChange?.(selected);
			}}
			variant="outline"
			size="sm"
			spacing={0}
			className={cn("h-8 w-full sm:w-auto", className)}
			aria-label="Time range"
		>
			{ranges.map((r) => (
				<ToggleGroupItem
					key={r.value}
					value={r.value}
					className="h-7 flex-1 px-2 text-[11px] sm:flex-none sm:px-3 sm:text-[12px]"
				>
					<span className="sm:hidden">{r.short}</span>
					<span className="hidden sm:inline">{r.value}</span>
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
