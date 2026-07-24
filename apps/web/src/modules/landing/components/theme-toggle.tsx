"use client";

import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import type { AtlasTheme } from "../lib/theme";
import { cn } from "../lib/utils";

type ThemeToggleProps = {
	theme: AtlasTheme;
	onToggle: () => void;
	className?: string;
	mounted?: boolean;
};

export function ThemeToggle({ theme, onToggle, className, mounted = true }: ThemeToggleProps) {
	const isDark = theme === "dark";

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={onToggle}
			aria-label={
				mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"
			}
			className={cn(
				"size-9 rounded-full border border-border/70 bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground",
				className,
			)}
		>
			{mounted ? (
				<HugeiconsIcon
					icon={isDark ? Sun01Icon : Moon01Icon}
					className="size-4"
					strokeWidth={1.75}
				/>
			) : (
				<span className="inline-block size-4" aria-hidden={true} />
			)}
		</Button>
	);
}
