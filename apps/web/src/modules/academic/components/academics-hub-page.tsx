"use client";

import {
	BookOpen01Icon,
	Calendar03Icon,
	Layers01Icon,
	Mortarboard01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { AcademicPageShell } from "./academic-page-shell";

const cards = [
	{
		href: "/admin/academics/years",
		title: "Academic years",
		description: "Define school years, active terms, and archival status.",
		icon: Calendar03Icon,
	},
	{
		href: "/admin/academics/grades",
		title: "Grades",
		description: "Manage grade levels used when creating sections and enrollments.",
		icon: Layers01Icon,
	},
	{
		href: "/admin/academics/sections",
		title: "Sections",
		description: "Create homeroom sections per campus, year, and grade.",
		icon: Mortarboard01Icon,
	},
	{
		href: "/admin/academics/subjects",
		title: "Subjects",
		description: "Manage the subject catalog for teacher assignments.",
		icon: BookOpen01Icon,
	},
] as const;

export function AcademicsHubPage() {
	return (
		<AcademicPageShell
			title="Academics"
			description="Configure the academic structure for your organization. Each area has its own page for create, edit, and delete."
		>
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{cards.map((card) => (
					<Link
						key={card.href}
						href={card.href}
						className="group rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4 transition-colors hover:border-dashboard-border-focus hover:bg-dashboard-surface-hover"
					>
						<div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
							<HugeiconsIcon icon={card.icon} size={20} strokeWidth={1.8} />
						</div>
						<h2 className="font-semibold text-[15px] text-dashboard-text-primary">{card.title}</h2>
						<p className="mt-1 text-[12.5px] text-dashboard-text-muted leading-5">
							{card.description}
						</p>
					</Link>
				))}
			</div>
		</AcademicPageShell>
	);
}
