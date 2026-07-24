"use client";

import {
	ArrowRight01Icon,
	BookOpen02Icon,
	Calendar03Icon,
	CheckmarkCircle02Icon,
	SparklesIcon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type {
	TeacherDashboard,
	TeacherDashboardMorningDigest,
	TeacherDashboardPriorityAction,
} from "../types/staff.types";

type Props = {
	sessionDate: string;
	stats: TeacherDashboard["stats"];
	digest: TeacherDashboardMorningDigest;
	firstPending?: TeacherDashboardPriorityAction;
	className?: string;
};

type ActionCard = {
	id: string;
	title: string;
	description: string;
	cta: string;
	href: string;
	icon: typeof Calendar03Icon;
	emphasis: boolean;
	secondsLabel?: string;
};

export function TeacherInstantActions({
	sessionDate,
	stats,
	digest,
	firstPending,
	className,
}: Props) {
	const confirmSuffix = stats.pendingAttendanceCount > 0 ? "&confirmAll=1" : "";
	const attendanceHref = firstPending
		? `/admin/attendance?sectionId=${firstPending.sectionId}&sessionDate=${sessionDate}${confirmSuffix}`
		: stats.homeroomCount > 0
			? `/admin/attendance?sessionDate=${sessionDate}`
			: "/admin/my-classes";

	const nextClassHref = digest.upcomingPeriod
		? `/admin/my-classes/${digest.upcomingPeriod.sectionId}`
		: "/admin/my-classes";

	const homeworkClassSectionId = digest.upcomingPeriod?.sectionId;
	const homeworkHref =
		digest.draftHomeworkCount > 0
			? "/admin/homework?status=draft"
			: homeworkClassSectionId
				? `/admin/my-classes/${homeworkClassSectionId}?assignHomework=1`
				: "/admin/my-classes";

	const cards: ActionCard[] = [
		{
			id: "attendance",
			title: stats.pendingAttendanceCount > 0 ? "Confirm attendance" : "Attendance",
			description:
				stats.pendingAttendanceCount > 0
					? `${stats.pendingAttendanceCount} homeroom${stats.pendingAttendanceCount === 1 ? "" : "s"} not finished · gate sync coming in Phase 1b`
					: stats.todayPresent > 0
						? `${stats.todayPresent} present recorded for today`
						: "Open roster and mark who is in class",
			cta: stats.pendingAttendanceCount > 0 ? "Finish marking" : "Open attendance",
			href: attendanceHref,
			icon: CheckmarkCircle02Icon,
			emphasis: stats.pendingAttendanceCount > 0,
			secondsLabel: stats.pendingAttendanceCount > 0 ? "~3 sec goal" : undefined,
		},
		{
			id: "homework",
			title: digest.draftHomeworkCount > 0 ? "Approve homework" : "Homework",
			description:
				digest.draftHomeworkCount > 0
					? `${digest.draftHomeworkCount} AI-ready draft${digest.draftHomeworkCount === 1 ? "" : "s"} · review and publish`
					: digest.dueTodayHomeworkCount > 0
						? `${digest.dueTodayHomeworkCount} due today · assign from class roster with AI`
						: "Draft homework from My classes without leaving the roster",
			cta: digest.draftHomeworkCount > 0 ? "Review drafts" : "Assign from class",
			href: homeworkHref,
			icon: digest.draftHomeworkCount > 0 ? SparklesIcon : BookOpen02Icon,
			emphasis: digest.draftHomeworkCount > 0,
			secondsLabel:
				digest.draftHomeworkCount > 0
					? "~5 sec approve"
					: homeworkClassSectionId
						? "~5 sec draft"
						: undefined,
		},
		{
			id: "next-class",
			title: digest.upcomingPeriod ? "Next period" : "My classes",
			description: digest.upcomingPeriod
				? `${digest.upcomingPeriod.subjectName ?? digest.upcomingPeriod.subjectCode ?? "Class"} · ${digest.upcomingPeriod.startsAt}–${digest.upcomingPeriod.endsAt}${digest.upcomingPeriod.roomName ? ` · ${digest.upcomingPeriod.roomName}` : ""}`
				: `${stats.totalClasses} classes · roster, ID cards, shortcuts`,
			cta: digest.upcomingPeriod ? "Open class" : "View classes",
			href: nextClassHref,
			icon: UserGroupIcon,
			emphasis: Boolean(digest.upcomingPeriod),
		},
	];

	return (
		<section className={cn("space-y-3", className)}>
			<div className="flex items-end justify-between gap-3">
				<div>
					<h2 className="font-medium text-[15px] text-foreground">
						One tap — you approve, we prep
					</h2>
					<p className="mt-0.5 text-[12px] text-muted-foreground">
						Phase 1: bulk attendance confirm, in-class AI homework, first-visit onboarding
					</p>
				</div>
				<Button
					size="sm"
					variant="ghost"
					className="hidden text-[12px] sm:inline-flex"
					nativeButton={false}
					render={<Link href="/admin/timetable" />}
				>
					<HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" strokeWidth={2} />
					Timetable
				</Button>
			</div>
			<div className="grid gap-3 md:grid-cols-3">
				{cards.map((card) => (
					<Link
						key={card.id}
						href={card.href}
						className={cn(
							"group flex flex-col rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md",
							card.emphasis
								? "border-primary/40 bg-primary/5 shadow-sm hover:border-primary/60"
								: "border-border bg-card hover:border-primary/30",
						)}
					>
						<div className="flex items-start justify-between gap-2">
							<div
								className={cn(
									"flex size-10 items-center justify-center rounded-lg",
									card.emphasis ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
								)}
							>
								<HugeiconsIcon icon={card.icon} strokeWidth={2} className="size-5" />
							</div>
							{card.secondsLabel ? (
								<span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wide">
									{card.secondsLabel}
								</span>
							) : null}
						</div>
						<p className="mt-3 font-semibold text-[15px] text-foreground">{card.title}</p>
						<p className="mt-1 flex-1 text-[12px] leading-relaxed text-muted-foreground">
							{card.description}
						</p>
						<span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-primary">
							{card.cta}
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								strokeWidth={2}
								className="size-4 transition-transform group-hover:translate-x-0.5"
							/>
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}
