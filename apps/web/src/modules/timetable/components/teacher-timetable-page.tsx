"use client";

import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Spinner } from "@school-os/ui/components/spinner";
import { useMemo, useState } from "react";
import { AdminPageShell } from "@/components/admin";
import { useClassesQuery } from "@/modules/academic";
import { useTenantContext } from "@/modules/tenants";
import { useMyWeekTimetableQuery } from "../hooks/use-timetable-queries";
import { TeacherTodaySchedule } from "./teacher-today-schedule";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function localSessionDate(): string {
	return new Date().toLocaleDateString("en-CA");
}

export function TeacherTimetablePage() {
	const { activeTenant } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const [anchorDate, setAnchorDate] = useState(localSessionDate);
	const weekQuery = useMyWeekTimetableQuery(tenantId, anchorDate);
	const classesQuery = useClassesQuery(tenantId, Boolean(tenantId));

	const classNameById = useMemo(
		() => new Map((classesQuery.data ?? []).map((item) => [item.id, item.name])),
		[classesQuery.data],
	);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Switch to an organization to view your timetable.</AlertDescription>
			</Alert>
		);
	}

	if (weekQuery.isLoading || classesQuery.isLoading) {
		return (
			<div className="flex min-h-[320px] items-center justify-center">
				<Spinner className="size-8" />
			</div>
		);
	}

	if (weekQuery.isError || !weekQuery.data) {
		return (
			<Alert>
				<AlertDescription>
					Your timetable is available when you are signed in as a teacher.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<AdminPageShell
			title="Timetable"
			description="Weekly teaching schedule with periods, classes, subjects, and rooms."
			icon={Calendar03Icon}
			maxWidth="5xl"
			className="px-3 sm:px-6 lg:px-8"
		>
			<div className="mb-4 flex flex-wrap items-center gap-3">
				<label className="flex items-center gap-2 text-[13px] text-muted-foreground">
					Week of
					<input
						type="date"
						value={anchorDate}
						onChange={(event) => setAnchorDate(event.target.value)}
						className="rounded-md border border-border bg-background px-2 py-1 text-foreground text-sm"
					/>
				</label>
			</div>

			<div className="space-y-8">
				{weekQuery.data.days.map((day) => (
					<section key={day.date}>
						<h2 className="mb-3 font-medium text-[15px] text-foreground">
							{DAY_LABELS[day.dayOfWeek - 1] ?? "Day"} · {day.date}
							<span className="ms-2 font-normal text-muted-foreground text-sm">
								{day.classCount} classes
							</span>
						</h2>
						<TeacherTodaySchedule schedule={day} classNameById={classNameById} />
					</section>
				))}
			</div>
		</AdminPageShell>
	);
}
