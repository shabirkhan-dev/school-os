"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@school-os/ui/components/tooltip";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
	value: string;
	label?: string;
	className?: string;
};

export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timeout = window.setTimeout(() => setCopied(false), 1600);
		return () => window.clearTimeout(timeout);
	}, [copied]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
		} catch {
			// Clipboard unavailable — ignore silently.
		}
	};

	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						aria-label={copied ? "Copied" : label}
						onClick={handleCopy}
						className={cn(
							"text-muted-foreground hover:text-foreground",
							copied && "text-emerald-600 dark:text-emerald-400",
							className,
						)}
					/>
				}
			>
				<HugeiconsIcon
					icon={copied ? Tick02Icon : Copy01Icon}
					strokeWidth={2}
					className="size-3.5"
				/>
			</TooltipTrigger>
			<TooltipContent side="top">{copied ? "Copied" : label}</TooltipContent>
		</Tooltip>
	);
}
