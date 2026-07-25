"use client";

import {
	BookOpen02Icon,
	Calendar03Icon,
	CreditCardIcon,
	File02Icon,
	SparklesIcon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@school-os/ui/components/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TeacherAccessibleSection } from "../types/staff.types";

type Props = {
	sectionId: string;
	section: TeacherAccessibleSection;
	sectionSubjectId?: string | null;
	onShowIdCards?: () => void;
	onAssignHomework?: () => void;
	onScheduleAssessment?: () => void;
	className?: string;
};

type TileBodyProps = {
	icon: IconSvgElement;
	tone: string;
	title: string;
	description: string;
};

const tileWrapperClasses =
	"group/tile block h-full w-full rounded-[14px] text-start outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

function QuickActionTileBody({ icon, tone, title, description }: TileBodyProps) {
	return (
		<Card
			size="sm"
			className={cn(
				"h-full rounded-[14px] border shadow-xs transition-all duration-200",
				"group-hover/tile:-translate-y-0.5 group-hover/tile:border-primary/40 group-hover/tile:shadow-md",
			)}
		>
			<CardContent className="flex items-start gap-3">
				<span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tone)}>
					<HugeiconsIcon icon={icon} size={20} strokeWidth={2} />
				</span>
				<span className="min-w-0">
					<span className="block font-medium text-sm">{title}</span>
					<span className="mt-0.5 block text-[12px] text-muted-foreground leading-snug">
						{description}
					</span>
				</span>
			</CardContent>
		</Card>
	);
}

export function ClassRosterQuickActions({
	sectionId,
	section,
	sectionSubjectId,
	onShowIdCards,
	onAssignHomework,
	onScheduleAssessment,
	className,
}: Props) {
	const isHomeroom = section.accessType === "homeroom";
	const attendanceHref = `/admin/attendance?sectionId=${sectionId}&confirmAll=1`;

	const homeworkTile = onAssignHomework ? (
		<button type="button" onClick={onAssignHomework} className={tileWrapperClasses}>
			<QuickActionTileBody
				icon={BookOpen02Icon}
				tone="bg-teal-500/10 text-teal-700 dark:text-teal-300"
				title="Assign homework"
				description={
					sectionSubjectId
						? `AI draft for ${section.subjectName ?? "this class"} — stay on roster.`
						: "Pick a subject and publish with AI assist."
				}
			/>
		</button>
	) : (
		<Link href="/admin/homework" className={tileWrapperClasses}>
			<QuickActionTileBody
				icon={BookOpen02Icon}
				tone="bg-teal-500/10 text-teal-700 dark:text-teal-300"
				title="Assign homework"
				description="Open homework to assign class work."
			/>
		</Link>
	);

	const assessmentTile = onScheduleAssessment ? (
		<button type="button" onClick={onScheduleAssessment} className={tileWrapperClasses}>
			<QuickActionTileBody
				icon={File02Icon}
				tone="bg-violet-500/10 text-violet-700 dark:text-violet-300"
				title="Schedule test"
				description="Quiz or exam for this class — synced to test planner."
			/>
		</button>
	) : (
		<Link href="/admin/assessments" className={tileWrapperClasses}>
			<QuickActionTileBody
				icon={File02Icon}
				tone="bg-violet-500/10 text-violet-700 dark:text-violet-300"
				title="Schedule test"
				description="Add an assessment or exam for this class."
			/>
		</Link>
	);

	return (
		<section className={cn("grid gap-2 sm:grid-cols-2 xl:grid-cols-4", className)}>
			{isHomeroom ? (
				<Link href={attendanceHref} className={tileWrapperClasses}>
					<QuickActionTileBody
						icon={Calendar03Icon}
						tone="bg-primary/10 text-primary"
						title="Mark attendance"
						description="Take today's homeroom roll call in one tap."
					/>
				</Link>
			) : null}

			{homeworkTile}

			{assessmentTile}

			<Link href="/admin/test-planner" className={tileWrapperClasses}>
				<QuickActionTileBody
					icon={SparklesIcon}
					tone="bg-amber-500/10 text-amber-800 dark:text-amber-200"
					title="Test planner"
					description="See your week at a glance and avoid clashes."
				/>
			</Link>

			{onShowIdCards ? (
				<button type="button" onClick={onShowIdCards} className={tileWrapperClasses}>
					<QuickActionTileBody
						icon={CreditCardIcon}
						tone="bg-sky-500/10 text-sky-700 dark:text-sky-300"
						title="ID card view"
						description="Switch to printable student ID cards."
					/>
				</button>
			) : null}
		</section>
	);
}
