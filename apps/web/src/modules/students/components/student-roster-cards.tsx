"use client";

import { Skeleton } from "@school-os/ui/components/skeleton";
import { cn } from "@/lib/utils";
import type { Student } from "../types/student.types";
import { StudentIdCard } from "./student-id-card";

type Props = {
	students: Student[];
	schoolName: string;
	tenantId: string;
	sectionLabelByStudentId: Map<string, string>;
	academicYearLabel?: string;
	loading?: boolean;
	className?: string;
	onStudentClick?: (student: Student) => void;
};

export function StudentRosterCards({
	students,
	schoolName,
	tenantId,
	sectionLabelByStudentId,
	academicYearLabel,
	loading,
	className,
	onStudentClick,
}: Props) {
	if (loading) {
		return (
			<div
				className={cn("grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", className)}
			>
				{["c1", "c2", "c3", "c4", "c5", "c6"].map((key) => (
					<Skeleton key={key} className="h-[220px] rounded-2xl" />
				))}
			</div>
		);
	}

	if (students.length === 0) {
		return (
			<div
				className={cn("flex h-40 flex-col items-center justify-center px-4 text-center", className)}
			>
				<p className="font-medium text-foreground">No students yet</p>
				<p className="mt-1 max-w-sm text-muted-foreground text-sm">
					Admit a student to see ID cards in this view.
				</p>
			</div>
		);
	}

	return (
		<div className={cn("grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", className)}>
			{students.map((student) => {
				const card = (
					<StudentIdCard
						student={student}
						schoolName={schoolName}
						tenantId={tenantId}
						sectionLabel={sectionLabelByStudentId.get(student.id)}
						academicYearLabel={academicYearLabel}
						className="mx-auto w-full"
					/>
				);

				if (!onStudentClick) {
					return <div key={student.id}>{card}</div>;
				}

				return (
					<button
						key={student.id}
						type="button"
						className="cursor-pointer rounded-2xl text-start transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						onClick={() => onStudentClick(student)}
					>
						{card}
					</button>
				);
			})}
		</div>
	);
}
