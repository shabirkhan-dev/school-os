"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AdminPageShell } from "@/components/admin";
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
		<AdminPageShell
			title={title}
			description={description}
			actions={actions}
			maxWidth="5xl"
			breadcrumb={{ label: "Academics", href: "/admin/academics" }}
			className={cn(className)}
		>
			{children}
		</AdminPageShell>
	);
}

/** @deprecated Use AdminPageShell breadcrumb prop instead */
export function AcademicBreadcrumbLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<Link href={href} className="hover:text-dashboard-text-secondary">
			{children}
		</Link>
	);
}
