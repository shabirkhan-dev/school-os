"use client";

import { AlertCircleIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TeacherDashboardAlert } from "../types/staff.types";

type Props = {
	alerts: TeacherDashboardAlert[];
	className?: string;
};

export function TeacherDashboardAlerts({ alerts, className }: Props) {
	if (alerts.length === 0) return null;

	return (
		<section className={cn("space-y-3", className)}>
			<div className="flex items-center gap-2">
				<HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 text-amber-600" />
				<h2 className="font-medium text-[15px] text-foreground">Alerts</h2>
			</div>
			<ul className="grid gap-2">
				{alerts.map((alert) => (
					<li
						key={`${alert.type}-${alert.studentId}`}
						className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<div className="min-w-0">
							<p className="font-medium text-foreground text-sm">{alert.studentName}</p>
							<p className="mt-0.5 text-muted-foreground text-sm">
								Absent {alert.consecutiveDays} consecutive school days · {alert.sectionLabel}
							</p>
						</div>
						<Button
							size="sm"
							variant="outline"
							className="shrink-0"
							nativeButton={false}
							render={<Link href={`/admin/my-classes/${alert.sectionId}`} />}
						>
							Review student
							<HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" strokeWidth={2} />
						</Button>
					</li>
				))}
			</ul>
		</section>
	);
}
