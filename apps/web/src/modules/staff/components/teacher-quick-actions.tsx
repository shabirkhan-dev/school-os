"use client";

import {
	Calendar03Icon,
	File02Icon,
	StudentIcon,
	TeacherIcon,
	UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
	sessionDate: string;
	firstPendingSectionId?: string;
	homeroomCount: number;
	className?: string;
};

export function TeacherQuickActions({
	sessionDate,
	firstPendingSectionId,
	homeroomCount,
	className,
}: Props) {
	const attendanceHref = firstPendingSectionId
		? `/admin/attendance?sectionId=${firstPendingSectionId}&sessionDate=${sessionDate}`
		: homeroomCount > 0
			? "/admin/attendance"
			: "/admin/my-classes";

	return (
		<section className={cn("space-y-3", className)}>
			<h2 className="font-medium text-[15px] text-foreground">Quick actions</h2>
			<div className="flex flex-wrap gap-2">
				<Button size="sm" nativeButton={false} render={<Link href={attendanceHref} />}>
					<HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" strokeWidth={2} />
					Take attendance
				</Button>
				<Button
					size="sm"
					variant="outline"
					nativeButton={false}
					render={<Link href="/admin/my-classes" />}
				>
					<HugeiconsIcon icon={UserGroupIcon} data-icon="inline-start" strokeWidth={2} />
					My classes
				</Button>
				<Button
					size="sm"
					variant="outline"
					nativeButton={false}
					render={<Link href="/admin/timetable" />}
				>
					<HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" strokeWidth={2} />
					Timetable
				</Button>
				<Button
					size="sm"
					variant="outline"
					nativeButton={false}
					render={<Link href="/admin/account/teacher" />}
				>
					<HugeiconsIcon icon={TeacherIcon} data-icon="inline-start" strokeWidth={2} />
					Teaching profile
				</Button>
				<Button
					size="sm"
					variant="outline"
					nativeButton={false}
					render={<Link href="/admin/test-planner" />}
				>
					<HugeiconsIcon icon={Calendar03Icon} data-icon="inline-start" strokeWidth={2} />
					Test planner
				</Button>
				<Button
					size="sm"
					variant="outline"
					nativeButton={false}
					render={<Link href="/admin/assessments" />}
				>
					<HugeiconsIcon icon={File02Icon} data-icon="inline-start" strokeWidth={2} />
					Tests & grades
				</Button>
				<Button
					size="sm"
					variant="outline"
					nativeButton={false}
					render={<Link href="/admin/homework" />}
				>
					<HugeiconsIcon icon={StudentIcon} data-icon="inline-start" strokeWidth={2} />
					Homework
				</Button>
			</div>
		</section>
	);
}
