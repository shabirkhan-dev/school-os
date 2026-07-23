"use client";

import { ArrowRight01Icon, BookOpen01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TeacherAccessibleSection, TeacherDashboardSection } from "../types/staff.types";

type Props = {
	section: TeacherAccessibleSection;
	label: string;
	campusName?: string;
	metrics?: Pick<TeacherDashboardSection, "studentCount" | "todayAttendance">;
	className?: string;
};

export function TeacherClassCard({ section, label, campusName, metrics, className }: Props) {
	const isHomeroom = section.accessType === "homeroom";
	const attendanceComplete = metrics?.todayAttendance.isComplete ?? false;
	const summary = metrics?.todayAttendance.summary;

	return (
		<article
			className={cn(
				"group flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/20",
				className,
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="font-medium text-[15px] text-foreground leading-snug">{label}</p>
					{campusName ? (
						<p className="mt-0.5 text-[12px] text-muted-foreground">{campusName}</p>
					) : null}
					{metrics ? (
						<p className="mt-2 text-[12px] text-muted-foreground">
							{metrics.studentCount} student{metrics.studentCount === 1 ? "" : "s"}
							{summary
								? ` · ${summary.present} present · ${summary.absent} absent`
								: attendanceComplete
									? " · attendance done"
									: " · attendance pending"}
						</p>
					) : null}
				</div>
				<Badge variant={isHomeroom ? "default" : "outline"} className="shrink-0 capitalize">
					{isHomeroom ? "Homeroom" : (section.subjectCode ?? "Subject")}
				</Badge>
			</div>

			{!isHomeroom && section.subjectName ? (
				<p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
					<HugeiconsIcon icon={BookOpen01Icon} size={14} strokeWidth={2} />
					{section.subjectName}
				</p>
			) : null}

			{metrics && metrics.studentCount > 0 && isHomeroom && summary ? (
				<div className="mt-3 flex flex-wrap gap-1.5">
					{summary.present > 0 ? (
						<Badge
							variant="secondary"
							className="bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
						>
							{summary.present} present
						</Badge>
					) : null}
					{summary.absent > 0 ? (
						<Badge variant="secondary" className="bg-red-500/10 text-red-800 dark:text-red-200">
							{summary.absent} absent
						</Badge>
					) : null}
					{summary.late > 0 ? (
						<Badge
							variant="secondary"
							className="bg-amber-500/10 text-amber-900 dark:text-amber-200"
						>
							{summary.late} late
						</Badge>
					) : null}
					{summary.unknown > 0 ? <Badge variant="outline">{summary.unknown} unmarked</Badge> : null}
				</div>
			) : null}

			{metrics && metrics.studentCount > 0 && isHomeroom ? (
				<div className="mt-3">
					<div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
						<span>Today&apos;s attendance</span>
						<span>{attendanceComplete ? "Complete" : "Pending"}</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-muted">
						<div
							className={cn(
								"h-full rounded-full transition-all",
								attendanceComplete ? "bg-emerald-500" : "bg-amber-500",
							)}
							style={{
								width: `${Math.max(
									attendanceComplete
										? 100
										: summary
											? Math.min(
													100,
													((summary.total - summary.unknown) / metrics.studentCount) * 100,
												)
											: 8,
									attendanceComplete ? 100 : 8,
								)}%`,
							}}
						/>
					</div>
				</div>
			) : null}

			<div className="mt-4 flex flex-wrap gap-2">
				<Button
					size="sm"
					variant="outline"
					className="flex-1 sm:flex-none"
					nativeButton={false}
					render={<Link href={`/admin/my-classes/${section.id}`} />}
				>
					View class
					<HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" strokeWidth={2} />
				</Button>
				{isHomeroom ? (
					<Button
						size="sm"
						variant="ghost"
						className="flex-1 sm:flex-none"
						nativeButton={false}
						render={
							<Link
								href={`/admin/attendance?sectionId=${section.id}`}
								aria-label="Mark attendance"
							/>
						}
					>
						<HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={2} />
						Attendance
					</Button>
				) : null}
			</div>
		</article>
	);
}
