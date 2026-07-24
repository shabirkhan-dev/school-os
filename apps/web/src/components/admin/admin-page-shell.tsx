"use client";

import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
	title: string;
	description?: string;
	icon?: IconSvgElement;
	breadcrumb?: { label: string; href: string } | null;
	actions?: ReactNode;
	loading?: boolean;
	maxWidth?: "5xl" | "6xl" | "7xl";
	children: ReactNode;
	className?: string;
};

export function AdminPageShell({
	title,
	description,
	icon,
	breadcrumb,
	actions,
	loading,
	maxWidth = "6xl",
	children,
	className,
}: Props) {
	const maxWidthClass =
		maxWidth === "7xl" ? "max-w-7xl" : maxWidth === "5xl" ? "max-w-5xl" : "max-w-6xl";

	if (loading) {
		return (
			<div className="flex min-h-[280px] items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	return (
		<div className={cn("mx-auto w-full px-4 py-6 sm:px-6", maxWidthClass, className)}>
			{breadcrumb ? (
				<nav className="mb-4 text-[12px] text-dashboard-text-muted">
					<Link href={breadcrumb.href} className="hover:text-dashboard-text-secondary">
						{breadcrumb.label}
					</Link>
					<span className="mx-2 text-dashboard-text-faint">/</span>
					<span className="text-dashboard-text-secondary">{title}</span>
				</nav>
			) : null}

			<header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-dashboard-border border-b pb-5">
				<div className="flex min-w-0 items-start gap-3">
					{icon ? (
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-dashboard-accent-soft text-dashboard-accent">
							<HugeiconsIcon icon={icon} size={20} strokeWidth={1.8} />
						</div>
					) : null}
					<div className="min-w-0">
						<h1 className="font-semibold text-[22px] text-dashboard-text-primary tracking-tight sm:text-[24px]">
							{title}
						</h1>
						{description ? (
							<p className="mt-1 max-w-2xl text-[13px] text-dashboard-text-muted leading-5">
								{description}
							</p>
						) : null}
					</div>
				</div>
				{actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
			</header>

			{children}
		</div>
	);
}
