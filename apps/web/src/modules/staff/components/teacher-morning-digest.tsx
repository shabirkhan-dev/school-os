"use client";

import {
	BookOpen02Icon,
	Calendar03Icon,
	Clock01Icon,
	Task01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { TeacherDashboardMorningDigest } from "../types/staff.types";

type Props = {
	digest: TeacherDashboardMorningDigest;
	sessionDate: string;
	className?: string;
};

function formatPeriodTime(startsAt: string, endsAt: string) {
	return `${startsAt} – ${endsAt}`;
}

export function TeacherMorningDigest({ digest, sessionDate, className }: Props) {
	const { upcomingPeriod, draftHomeworkCount, dueTodayHomeworkCount, yesterdayUnmarkedSections } =
		digest;

	const homeworkAttention = draftHomeworkCount > 0 || dueTodayHomeworkCount > 0;
	const attendanceAttention = yesterdayUnmarkedSections.length > 0;

	return (
		<div className={cn("grid gap-3 lg:grid-cols-2", className)}>
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<div className="flex items-start justify-between gap-2">
					<div>
						<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
							Next on timetable
						</p>
						{upcomingPeriod ? (
							<>
								<p className="mt-1 font-semibold text-[17px] text-foreground">
									{upcomingPeriod.subjectName ?? upcomingPeriod.subjectCode ?? "Class"} · Section{" "}
									{upcomingPeriod.sectionName}
								</p>
								<p className="mt-1 text-[13px] text-muted-foreground">
									{upcomingPeriod.periodName} ·{" "}
									{formatPeriodTime(upcomingPeriod.startsAt, upcomingPeriod.endsAt)}
									{upcomingPeriod.roomName ? ` · Room ${upcomingPeriod.roomName}` : null}
								</p>
							</>
						) : (
							<p className="mt-1 text-[13px] text-muted-foreground">
								No more classes scheduled for {sessionDate}.
							</p>
						)}
					</div>
					<HugeiconsIcon
						icon={Clock01Icon}
						strokeWidth={2}
						className="size-5 shrink-0 text-muted-foreground"
					/>
				</div>
				<div className="mt-3 flex flex-wrap gap-2">
					<Link href="/admin/timetable" className="text-[13px] text-primary hover:underline">
						Full timetable
					</Link>
					{upcomingPeriod ? (
						<Link
							href={`/admin/my-classes/${upcomingPeriod.sectionId}`}
							className="text-[13px] text-primary hover:underline"
						>
							Open class
						</Link>
					) : null}
				</div>
			</div>

			<div
				className={cn(
					"rounded-xl border bg-card p-4 shadow-sm",
					homeworkAttention || attendanceAttention
						? "border-amber-500/35 bg-amber-500/5"
						: "border-border",
				)}
			>
				<div className="flex items-start justify-between gap-2">
					<p className="text-[11px] text-muted-foreground uppercase tracking-wide">
						Morning checklist
					</p>
					<HugeiconsIcon
						icon={Task01Icon}
						strokeWidth={2}
						className="size-5 shrink-0 text-muted-foreground"
					/>
				</div>
				<ul className="mt-3 space-y-2 text-[13px]">
					<li className="flex items-center justify-between gap-3">
						<span className="flex items-center gap-2 text-muted-foreground">
							<HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} className="size-4" />
							Homework drafts
						</span>
						<Link href="/admin/homework" className="font-medium tabular-nums hover:underline">
							{draftHomeworkCount}
						</Link>
					</li>
					<li className="flex items-center justify-between gap-3">
						<span className="flex items-center gap-2 text-muted-foreground">
							<HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
							Due today
						</span>
						<Link href="/admin/homework" className="font-medium tabular-nums hover:underline">
							{dueTodayHomeworkCount}
						</Link>
					</li>
					<li className="flex flex-col gap-1">
						<span className="text-muted-foreground">Yesterday — attendance not opened</span>
						{yesterdayUnmarkedSections.length === 0 ? (
							<span className="font-medium text-foreground">All homerooms marked</span>
						) : (
							<ul className="flex flex-wrap gap-x-3 gap-y-1">
								{yesterdayUnmarkedSections.map((section) => (
									<li key={section.sectionId}>
										<Link
											href={`/admin/attendance?sectionId=${section.sectionId}`}
											className="font-medium text-primary hover:underline"
										>
											Section {section.sectionName}
										</Link>
									</li>
								))}
							</ul>
						)}
					</li>
				</ul>
			</div>
		</div>
	);
}
