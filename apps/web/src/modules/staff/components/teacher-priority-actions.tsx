"use client";

import { AlertCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TeacherDashboardPriorityAction } from "../types/staff.types";

type Props = {
	actions: TeacherDashboardPriorityAction[];
	sessionDate: string;
	className?: string;
};

export function TeacherPriorityActions({ actions, sessionDate, className }: Props) {
	if (actions.length === 0) {
		return (
			<div
				className={cn(
					"rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-5 text-sm",
					className,
				)}
			>
				<p className="font-medium text-emerald-800 dark:text-emerald-200">You are all caught up</p>
				<p className="mt-1 text-emerald-700/90 dark:text-emerald-300/90">
					No urgent attendance tasks for {sessionDate}. Open a class anytime to review the roster.
				</p>
			</div>
		);
	}

	return (
		<div className={cn("space-y-3", className)}>
			<div className="flex items-center gap-2">
				<HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 text-amber-600" />
				<h2 className="font-medium text-[15px] text-foreground">Priority actions</h2>
			</div>
			<ul className="grid gap-2">
				{actions.map((action) => {
					const confirmSuffix = action.type === "mark_attendance" ? "&confirmAll=1" : "";
					const href =
						action.type === "mark_attendance"
							? `/admin/attendance?sectionId=${action.sectionId}&sessionDate=${sessionDate}${confirmSuffix}`
							: `/admin/my-classes/${action.sectionId}`;

					return (
						<li
							key={`${action.type}-${action.sectionId}`}
							className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="min-w-0">
								<p className="font-medium text-foreground text-sm">{action.label}</p>
								<p className="mt-0.5 text-muted-foreground text-sm">{action.reason}</p>
							</div>
							<Button
								size="sm"
								variant={action.type === "mark_attendance" ? "default" : "outline"}
								className="shrink-0"
								nativeButton={false}
								render={<Link href={href} />}
							>
								{action.type === "mark_attendance" ? "Confirm all present" : "Review class"}
								<HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" strokeWidth={2} />
							</Button>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
