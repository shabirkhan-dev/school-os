"use client";

import { Motion01Icon, Motion02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { useMotion } from "@school-os/ui/components/motion-provider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@school-os/ui/components/tooltip";
import { cn } from "@/lib/utils";

/**
 * Global animation on/off toggle. Drives <MotionProvider> which suppresses all
 * Framer Motion (via MotionConfig) and CSS animations (via [data-animations]).
 */
export function AnimationToggleControl({ className }: { className?: string }) {
	const { enabled, toggle } = useMotion();

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						aria-label={enabled ? "Disable animations" : "Enable animations"}
						aria-pressed={enabled}
						onClick={toggle}
						className={cn("text-muted-foreground", className)}
					/>
				}
			>
				<HugeiconsIcon icon={enabled ? Motion01Icon : Motion02Icon} strokeWidth={2} />
			</TooltipTrigger>
			<TooltipContent side="bottom">{enabled ? "Animations on" : "Animations off"}</TooltipContent>
		</Tooltip>
	);
}
