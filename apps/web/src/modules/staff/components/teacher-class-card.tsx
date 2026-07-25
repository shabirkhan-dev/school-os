"use client";

import {
	ArrowRight01Icon,
	BookOpen02Icon,
	Calendar03Icon,
	CheckmarkCircle02Icon,
	ClipboardPenIcon,
	File02Icon,
	Home10Icon,
	MoreVerticalIcon,
	Notebook01Icon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@school-os/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@school-os/ui/components/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@school-os/ui/components/tooltip";
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
	/** Entrance animation delay in seconds (staggered reveal). */
	revealDelay?: number;
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
	revealDelay = 0,
	className,
}: Props) {
	const reducedMotion = useReducedMotion();
	const isHomeroom = section.accessType === "homeroom";
	const attendanceComplete = metrics?.todayAttendance.isComplete ?? false;
	const summary = metrics?.todayAttendance.summary;
	const studentCount = metrics?.studentCount ?? 0;

	const homeworkButton = onAssignHomework ? (
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
	);

	const assessmentButton = onScheduleAssessment ? (
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
	);

	return (
		<motion.div
			initial={reducedMotion ? false : { opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: revealDelay }}
			className={cn("h-full", className)}
		>
			<Card
				size="sm"
				className={cn(
					"group h-full rounded-[14px] border shadow-xs transition-all duration-200",
					"hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
					"focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-ring/30",
					isHomeroom ? "border-dashboard-border bg-dashboard-card-outer" : "bg-card",
				)}
			>
				<CardHeader className="gap-2">
					<div className="flex flex-wrap items-center gap-1.5">
						<Badge
							variant={isHomeroom ? "default" : "outline"}
							className="gap-1 text-[11px] capitalize"
						>
							<HugeiconsIcon icon={isHomeroom ? Home10Icon : Notebook01Icon} strokeWidth={2} />
							{isHomeroom ? "Homeroom" : (section.subjectCode ?? "Subject")}
						</Badge>
						{academicYearName ? (
							<span className="text-[11px] text-muted-foreground">{academicYearName}</span>
						) : null}
						{campusName ? (
							<span className="ms-auto max-w-[45%] truncate text-[11px] text-muted-foreground">
								{campusName}
							</span>
						) : null}
					</div>
					<CardTitle className="text-[16px] tracking-tight transition-colors group-hover:text-primary">
						{label}
					</CardTitle>
					{!isHomeroom && section.subjectName ? (
						<CardDescription className="text-[13px]">{section.subjectName}</CardDescription>
					) : null}
				</CardHeader>

				<CardContent className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
						<span className="flex items-center gap-1.5">
							<HugeiconsIcon icon={UserGroupIcon} size={14} strokeWidth={2} />
							{metrics
								? `${studentCount} student${studentCount === 1 ? "" : "s"}`
								: "Roster assigned"}
						</span>
						{isHomeroom && metrics ? (
							<span
								className={cn(
									"flex items-center gap-1 font-medium text-[11px]",
									attendanceComplete
										? "text-emerald-600 dark:text-emerald-400"
										: "text-amber-600 dark:text-amber-400",
								)}
							>
								<HugeiconsIcon
									icon={attendanceComplete ? CheckmarkCircle02Icon : ClipboardPenIcon}
									size={13}
									strokeWidth={2}
								/>
								{attendanceComplete ? "Attendance done" : "Attendance pending"}
							</span>
						) : null}
					</div>

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
				</CardContent>

				<CardFooter className="flex-wrap gap-1.5">
					<Button
						size="sm"
						variant="outline"
						className="flex-1 text-xs"
						nativeButton={false}
						render={<Link href={`/admin/my-classes/${section.id}`} />}
					>
						View class
						<HugeiconsIcon
							icon={ArrowRight01Icon}
							data-icon="inline-end"
							strokeWidth={2}
							className="rtl:rotate-180"
						/>
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

					{homeworkButton}
					{assessmentButton}

					<TooltipProvider>
						<DropdownMenu>
							<Tooltip>
								<TooltipTrigger
									render={
										<DropdownMenuTrigger
											render={
												<Button
													size="sm"
													variant="ghost"
													className="ms-auto size-7 px-0"
													aria-label={`More actions for ${label}`}
												/>
											}
										/>
									}
								>
									<HugeiconsIcon icon={MoreVerticalIcon} strokeWidth={2} />
								</TooltipTrigger>
								<TooltipContent>More actions</TooltipContent>
							</Tooltip>
							<DropdownMenuContent align="end" className="min-w-48">
								<DropdownMenuLabel>{label}</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem render={<Link href={`/admin/my-classes/${section.id}`} />}>
									<HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
									View roster
								</DropdownMenuItem>
								{isHomeroom ? (
									<DropdownMenuItem
										render={
											<Link href={`/admin/attendance?sectionId=${section.id}&confirmAll=1`} />
										}
									>
										<HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
										Mark attendance
									</DropdownMenuItem>
								) : null}
								<DropdownMenuItem
									render={<Link href={`/admin/my-classes/${section.id}?assignHomework=1`} />}
								>
									<HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />
									Assign homework
								</DropdownMenuItem>
								<DropdownMenuItem
									render={<Link href={`/admin/my-classes/${section.id}?assignAssessment=1`} />}
								>
									<HugeiconsIcon icon={File02Icon} strokeWidth={2} />
									Schedule test
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</TooltipProvider>
				</CardFooter>
			</Card>
		</motion.div>
	);
}
