"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
	title: string;
	description: string;
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
};

export function AcademicPageShell({ title, description, actions, children, className }: Props) {
	return (
		<div className={cn("mx-auto w-full max-w-5xl px-4 py-6 sm:px-6", className)}>
			<nav className="mb-4 text-[12px] text-dashboard-text-muted">
				<Link href="/admin/academics" className="hover:text-dashboard-text-secondary">
					Academics
				</Link>
				<span className="mx-2 text-dashboard-text-faint">/</span>
				<span className="text-dashboard-text-secondary">{title}</span>
			</nav>
			<header className="mb-6 flex flex-wrap items-start justify-between gap-3 border-dashboard-border border-b pb-5">
				<div>
					<h1 className="font-semibold text-[24px] text-dashboard-text-primary">{title}</h1>
					<p className="mt-1 max-w-2xl text-[13px] text-dashboard-text-muted">{description}</p>
				</div>
				{actions}
			</header>
			{children}
		</div>
	);
}
