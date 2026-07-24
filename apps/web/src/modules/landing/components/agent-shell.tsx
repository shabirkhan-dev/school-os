"use client";

import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type AgentShellProps = {
	children: ReactNode;
};

export function AgentShell({ children }: AgentShellProps) {
	return (
		<div data-landing className="relative min-h-screen bg-background text-foreground antialiased">
			<div
				className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(10,104,71,0.07),transparent)] dark:bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(60,184,130,0.12),transparent)]"
				aria-hidden="true"
			/>
			<SiteHeader />
			<main>{children}</main>
			<SiteFooter />
		</div>
	);
}
