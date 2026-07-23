"use client";

import type { ReactNode } from "react";
import { SITE } from "../data/landing.data";
import { useAtlasTheme } from "../lib/theme";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { ThemeToggle } from "./theme-toggle";

type AgentShellProps = {
	children: ReactNode;
};

export function AgentShell({ children }: AgentShellProps) {
	const { theme, toggleTheme, mounted } = useAtlasTheme();

	return (
		<div data-landing className="relative min-h-screen bg-background text-foreground antialiased">
			<div
				className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(10,104,71,0.07),transparent)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(60,184,130,0.12),transparent)]"
				aria-hidden="true"
			/>
			<SiteHeader />
			<main>{children}</main>
			<SiteFooter />

			<div className="relative border-t border-border/60 px-4">
				<div className="mx-auto flex w-full max-w-6xl items-center justify-between py-5">
					<p className="text-xs text-muted-foreground">
						© 2026 {SITE.name}. Built for schools that earn parent trust.
					</p>
					<ThemeToggle theme={theme} onToggle={toggleTheme} mounted={mounted} />
				</div>
			</div>
		</div>
	);
}
