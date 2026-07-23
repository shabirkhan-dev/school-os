"use client";

import { Moon01Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
		<button
			type="button"
			onClick={onToggle}
			aria-label={
				mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Toggle theme"
			}
			className={cn(
				"inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/60 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
				className,
			)}
		>
			{mounted ? (
				<HugeiconsIcon
					icon={isDark ? Sun01Icon : Moon01Icon}
					className="h-4 w-4"
					strokeWidth={1.75}
				/>
			) : (
				<span className="inline-block size-4" aria-hidden={true} />
			)}
		</button>
	);
}
