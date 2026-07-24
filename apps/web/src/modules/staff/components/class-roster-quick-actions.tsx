"use client";

import {
	BookOpen02Icon,
	Calendar03Icon,
	CreditCardIcon,
	File02Icon,
	SparklesIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { TeacherAccessibleSection } from "../types/staff.types";

type Props = {
	sectionId: string;
	section: TeacherAccessibleSection;
	sectionSubjectId?: string | null;
	onShowIdCards?: () => void;
	className?: string;
};

export function ClassRosterQuickActions({
	sectionId,
	section,
	sectionSubjectId,
	onShowIdCards,
	className,
}: Props) {
	const isHomeroom = section.accessType === "homeroom";
	const homeworkHref = sectionSubjectId ? "/admin/homework" : "/admin/homework";
	const assessmentsHref = sectionSubjectId ? "/admin/assessments" : "/admin/assessments";

	return (
		<section className={cn("grid gap-2 sm:grid-cols-2 xl:grid-cols-4", className)}>
			{isHomeroom ? (
				<Link
					href={`/admin/attendance?sectionId=${sectionId}`}
					className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20"
				>
					<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<HugeiconsIcon icon={Calendar03Icon} size={20} strokeWidth={2} />
					</span>
					<span className="min-w-0">
						<span className="block font-medium text-sm">Mark attendance</span>
						<span className="mt-0.5 block text-[12px] text-muted-foreground leading-snug">
							Take today&apos;s homeroom roll call in one tap.
						</span>
					</span>
				</Link>
			) : null}

			<Link
				href={homeworkHref}
				className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20"
			>
				<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300">
					<HugeiconsIcon icon={BookOpen02Icon} size={20} strokeWidth={2} />
				</span>
				<span className="min-w-0">
					<span className="block font-medium text-sm">Assign homework</span>
					<span className="mt-0.5 block text-[12px] text-muted-foreground leading-snug">
						{sectionSubjectId
							? `Create work for ${section.subjectName ?? "this class"}.`
							: "Open homework to assign class work."}
					</span>
				</span>
			</Link>

			<Link
				href={assessmentsHref}
				className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20"
			>
				<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-700 dark:text-violet-300">
					<HugeiconsIcon icon={File02Icon} size={20} strokeWidth={2} />
				</span>
				<span className="min-w-0">
					<span className="block font-medium text-sm">Schedule test</span>
					<span className="mt-0.5 block text-[12px] text-muted-foreground leading-snug">
						Add an assessment or exam for this class.
					</span>
				</span>
			</Link>

			<Link
				href="/admin/test-planner"
				className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20"
			>
				<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-200">
					<HugeiconsIcon icon={SparklesIcon} size={20} strokeWidth={2} />
				</span>
				<span className="min-w-0">
					<span className="block font-medium text-sm">Test planner</span>
					<span className="mt-0.5 block text-[12px] text-muted-foreground leading-snug">
						See your week at a glance and avoid clashes.
					</span>
				</span>
			</Link>

			{onShowIdCards ? (
				<button
					type="button"
					onClick={onShowIdCards}
					className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-start shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20"
				>
					<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300">
						<HugeiconsIcon icon={CreditCardIcon} size={20} strokeWidth={2} />
					</span>
					<span className="min-w-0">
						<span className="block font-medium text-sm">ID card view</span>
						<span className="mt-0.5 block text-[12px] text-muted-foreground leading-snug">
							Switch to printable student ID cards.
						</span>
					</span>
				</button>
			) : null}
		</section>
	);
}
