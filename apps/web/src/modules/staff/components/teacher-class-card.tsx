"use client";

import {
	ArrowRight01Icon,
	BookOpen01Icon,
	BookOpen02Icon,
	Calendar03Icon,
	File02Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TeacherAccessibleSection, TeacherDashboardSection } from "../types/staff.types";

type Props = {
	section: TeacherAccessibleSection;
	label: string;
	campusName?: string;
	academicYearName?: string;
	metrics?: Pick<TeacherDashboardSection, "studentCount" | "todayAttendance">;
	onAssignHomework?: (section: TeacherAccessibleSection) => void;
	onScheduleAssessment?: (section: TeacherAccessibleSection) => void;
	className?: string;
};

export function TeacherClassCard({
	section,
	label,
	campusName,
	academicYearName,
	metrics,
	onAssignHomework,
	onScheduleAssessment,
	className,
}: Props) {
	const reducedMotion = useReducedMotion();
	const isHomeroom = section.accessType === "homeroom";
	const attendanceComplete = metrics?.todayAttendance.isComplete ?? false;
	const summary = metrics?.todayAttendance.summary;
	const studentCount = metrics?.studentCount ?? 0;

	return (
		<motion.article
			whileHover={reducedMotion ? undefined : { y: -1 }}
			transition={{ duration: 0.12, ease: "easeOut" }}
			className={cn(
				"group flex flex-col justify-between rounded-xl border bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm",
				className,
			)}
		>
			<div className="flex flex-col gap-3">
				{/* Top line: Badges & Campus */}
				<div className="flex items-start justify-between gap-2">
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-1.5 mb-1">
							<Badge
								variant={isHomeroom ? "default" : "outline"}
								className="capitalize text-[11px]"
							>
								{isHomeroom ? "Homeroom" : (section.subjectCode ?? "Subject")}
							</Badge>
							{academicYearName ? (
								<span className="text-[11px] text-muted-foreground">{academicYearName}</span>
							) : null}
						</div>
						<h3 className="font-medium text-[15px] text-foreground leading-snug group-hover:text-primary transition-colors">
							{label}
						</h3>
					</div>
					{campusName ? (
						<span className="shrink-0 text-[12px] text-muted-foreground">{campusName}</span>
					) : null}
				</div>

				{/* Subject Info */}
				{!isHomeroom && section.subjectName ? (
					<p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
						<HugeiconsIcon icon={BookOpen01Icon} size={14} strokeWidth={2} className="shrink-0" />
						<span>{section.subjectName}</span>
					</p>
				) : null}

				{/* Roster & Attendance Status */}
				<div className="flex items-center justify-between text-[12px] text-muted-foreground">
					<span className="flex items-center gap-1.5">
						<HugeiconsIcon icon={UserGroupIcon} size={14} strokeWidth={2} />
						{metrics
							? `${studentCount} student${studentCount === 1 ? "" : "s"}`
							: "Roster assigned"}
					</span>
					{isHomeroom && metrics ? (
						<span
							className={cn(
								"font-medium text-[11px]",
								attendanceComplete
									? "text-emerald-600 dark:text-emerald-400"
									: "text-amber-600 dark:text-amber-400",
							)}
						>
							{attendanceComplete ? "Attendance done" : "Attendance pending"}
						</span>
					) : null}
				</div>

				{/* Homeroom Attendance Pills */}
				{isHomeroom && summary && studentCount > 0 ? (
					<div className="flex flex-wrap gap-1.5 text-[11px]">
						{summary.present > 0 ? (
							<span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
								{summary.present} present
							</span>
						) : null}
						{summary.absent > 0 ? (
							<span className="rounded-md bg-red-500/10 px-2 py-0.5 font-medium text-red-700 dark:text-red-300">
								{summary.absent} absent
							</span>
						) : null}
						{summary.late > 0 ? (
							<span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300">
								{summary.late} late
							</span>
						) : null}
						{summary.unknown > 0 ? (
							<span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
								{summary.unknown} unmarked
							</span>
						) : null}
					</div>
				) : null}
			</div>

			{/* Quick Action Buttons */}
			<div className="mt-4 pt-3 border-t flex flex-wrap items-center gap-1.5">
				<Button
					size="sm"
					variant="outline"
					className="flex-1 text-xs"
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
						className="text-xs"
						nativeButton={false}
						render={
							<Link
								href={`/admin/attendance?sectionId=${section.id}&confirmAll=1`}
								aria-label="Mark attendance"
							/>
						}
					>
						<HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" strokeWidth={2} />
						Attendance
					</Button>
				) : null}

				{onAssignHomework ? (
					<Button
						size="sm"
						variant="ghost"
						className="text-xs"
						onClick={() => onAssignHomework(section)}
						aria-label="Assign homework"
					>
						<HugeiconsIcon icon={BookOpen02Icon} data-icon="inline-start" strokeWidth={2} />
						Homework
					</Button>
				) : (
					<Button
						size="sm"
						variant="ghost"
						className="text-xs"
						nativeButton={false}
						render={
							<Link
								href={`/admin/my-classes/${section.id}?assignHomework=1`}
								aria-label="Assign homework"
							/>
						}
					>
						<HugeiconsIcon icon={BookOpen02Icon} data-icon="inline-start" strokeWidth={2} />
						Homework
					</Button>
				)}

				{onScheduleAssessment ? (
					<Button
						size="sm"
						variant="ghost"
						className="text-xs"
						onClick={() => onScheduleAssessment(section)}
						aria-label="Schedule test"
					>
						<HugeiconsIcon icon={File02Icon} data-icon="inline-start" strokeWidth={2} />
						Test
					</Button>
				) : (
					<Button
						size="sm"
						variant="ghost"
						className="text-xs"
						nativeButton={false}
						render={
							<Link
								href={`/admin/my-classes/${section.id}?assignAssessment=1`}
								aria-label="Schedule test"
							/>
						}
					>
						<HugeiconsIcon icon={File02Icon} data-icon="inline-start" strokeWidth={2} />
						Test
					</Button>
				)}
			</div>
		</motion.article>
	);
}
