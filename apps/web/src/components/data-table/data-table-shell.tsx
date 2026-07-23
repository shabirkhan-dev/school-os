"use client";

import { Card } from "@school-os/ui/components/card";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
	toolbar?: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
	className?: string;
};

export function DataTableShell({ toolbar, children, footer, className }: Props) {
	return (
		<Card className={cn("gap-0 overflow-hidden border-border bg-card py-0 shadow-sm", className)}>
			{toolbar}
			<div className="bg-card">{children}</div>
			{footer}
		</Card>
	);
}
