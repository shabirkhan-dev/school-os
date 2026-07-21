import type { ReactNode } from "react";
import { cn } from "../lib/utils";

type DemoGlassCardProps = {
	children: ReactNode;
	className?: string;
	innerClassName?: string;
	/** panel = theme-aware card; device = light phone/WhatsApp mock; dark = charcoal timeline */
	variant?: "panel" | "device" | "dark";
};

/** Frosted demo panel — shared across hero walkthrough and product mocks. */
export function DemoGlassCard({
	children,
	className,
	innerClassName,
	variant = "panel",
}: DemoGlassCardProps) {
	return (
		<div
			className={cn(
				"rounded-[1.25rem] p-1 shadow-lg ring-1 sm:rounded-[1.4rem] sm:shadow-xl backdrop-blur-md",
				variant === "device"
					? "bg-white/25 ring-white/40 dark:bg-white/10 dark:ring-white/15"
					: variant === "dark"
						? "bg-neutral-950/30 ring-white/10"
						: "bg-card/30 ring-border/50",
				className,
			)}
		>
			<div
				className={cn(
					"rounded-xl border p-3.5 sm:rounded-2xl sm:p-4",
					variant === "device"
						? "border-black/[0.06] bg-white/96 dark:border-white/10 dark:bg-[#f8faf9]"
						: variant === "dark"
							? "border-white/10 bg-neutral-950/90"
							: "border-border bg-card/95",
					innerClassName,
				)}
			>
				{children}
			</div>
		</div>
	);
}
