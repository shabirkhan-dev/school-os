"use client";

import { Calendar03Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@school-os/ui/components/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TeacherDaySchedule, TimetableSlot } from "../types/timetable.types";

type Props = {
	schedule: TeacherDaySchedule | null | undefined;
	className?: string;
	compact?: boolean;
};

function formatSlotTime(startsAt: string, endsAt: string): string {
	return `${startsAt} – ${endsAt}`;
}

function slotLabel(slot: TimetableSlot, classNameById?: Map<string, string>): string {
	if (slot.type === "break") return slot.period.name;
	if (slot.type === "free") return "Free";
	const grade = classNameById?.get(slot.classId);
	const subject = slot.subjectName ?? "Class";
	const section = slot.sectionName;
	return grade ? `${grade} ${section} · ${subject}` : `${section} · ${subject}`;
}

export function TeacherTodaySchedule({
	schedule,
	className,
	compact = false,
	classNameById,
}: Props & { classNameById?: Map<string, string> }) {
	if (!schedule || schedule.slots.length === 0) {
		return (
			<div
				className={cn(
					"rounded-xl border border-border border-dashed px-4 py-8 text-center text-[13px] text-muted-foreground",
					className,
				)}
			>
				No timetable configured yet. Your administrator can assign periods and classes.
			</div>
		);
	}

	const visibleSlots = schedule.slots.filter((slot) => slot.type !== "break" || !compact);

	return (
		<div className={cn("space-y-2", className)}>
			{visibleSlots.map((slot) => {
				const time = formatSlotTime(slot.period.startsAt, slot.period.endsAt);
				const isClass = slot.type === "class";
				const isFree = slot.type === "free";
				const isBreak = slot.type === "break";

				return (
					<div
						key={slot.period.id}
						className={cn(
							"flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
							isClass && "border-border bg-card",
							isFree && "border-border/60 bg-muted/20",
							isBreak && "border-border/40 bg-muted/10",
						)}
					>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-medium text-foreground text-sm">
									{slotLabel(slot, classNameById)}
								</span>
								{isBreak ? (
									<Badge variant="secondary" className="text-[10px]">
										Break
									</Badge>
								) : null}
								{isFree ? (
									<Badge variant="outline" className="text-[10px]">
										Free
									</Badge>
								) : null}
							</div>
							<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
								<span className="inline-flex items-center gap-1 tabular-nums">{time}</span>
								{isClass && slot.roomName ? (
									<span className="inline-flex items-center gap-1">
										<HugeiconsIcon icon={Location01Icon} size={14} strokeWidth={1.8} />
										{slot.roomName}
									</span>
								) : null}
							</div>
						</div>
						{isClass ? (
							<Link
								href={`/admin/my-classes/${slot.sectionId}`}
								className="shrink-0 text-[13px] text-primary hover:underline"
							>
								Open class
							</Link>
						) : null}
					</div>
				);
			})}
			{!compact ? (
				<p className="flex items-center gap-1.5 pt-1 text-[12px] text-muted-foreground">
					<HugeiconsIcon icon={Calendar03Icon} size={14} strokeWidth={1.8} />
					{schedule.classCount} class{schedule.classCount === 1 ? "" : "es"} scheduled today
				</p>
			) : null}
		</div>
	);
}
