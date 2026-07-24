"use client";

import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { Checkbox } from "@school-os/ui/components/checkbox";
import { Field, FieldLabel } from "@school-os/ui/components/field";
import { SelectField } from "@school-os/ui/components/select-field";
import { Spinner } from "@school-os/ui/components/spinner";
import { useMemo } from "react";
import { useSectionStudentRoster } from "@/modules/academics/hooks/use-section-student-roster";
import type { AssignMode } from "@/modules/homework/types/homework.types";

type Props = {
	tenantId: string | null;
	campusId: string | null;
	sectionId: string | null;
	assignMode: AssignMode;
	studentIds: string[];
	onAssignModeChange: (mode: AssignMode) => void;
	onStudentIdsChange: (studentIds: string[]) => void;
	disabled?: boolean;
};

const assignModeOptions = [
	{ label: "Whole class", value: "whole_class" },
	{ label: "Selected students", value: "selected_students" },
];

export function AssignTargetPanel({
	tenantId,
	campusId,
	sectionId,
	assignMode,
	studentIds,
	onAssignModeChange,
	onStudentIdsChange,
	disabled,
}: Props) {
	const { students, isLoading } = useSectionStudentRoster(
		tenantId,
		sectionId,
		campusId,
		Boolean(tenantId && sectionId),
	);

	const selectedSet = useMemo(() => new Set(studentIds), [studentIds]);

	function toggleStudent(studentId: string) {
		if (selectedSet.has(studentId)) {
			onStudentIdsChange(studentIds.filter((id) => id !== studentId));
			return;
		}
		onStudentIdsChange([...studentIds, studentId]);
	}

	function selectAll() {
		onStudentIdsChange(students.map((student) => student.id));
	}

	return (
		<div className="space-y-3 rounded-xl border border-dashboard-border bg-dashboard-surface/40 p-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div>
					<p className="font-medium text-[13px] text-foreground">Who receives this?</p>
					<p className="text-[12px] text-dashboard-text-muted">
						Assign to the full class or hand-pick students.
					</p>
				</div>
				<Badge variant="secondary">{students.length} enrolled</Badge>
			</div>

			<Field>
				<FieldLabel>Assignment target</FieldLabel>
				<SelectField
					items={assignModeOptions}
					value={assignMode}
					onValueChange={(value) => onAssignModeChange(value as AssignMode)}
					disabled={disabled}
				/>
			</Field>

			{assignMode === "selected_students" ? (
				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2">
						<p className="font-medium text-[13px]">Select students</p>
						<Button
							type="button"
							size="sm"
							variant="ghost"
							onClick={selectAll}
							disabled={disabled || students.length === 0}
						>
							Select all
						</Button>
					</div>

					{isLoading ? (
						<div className="flex min-h-[120px] items-center justify-center">
							<Spinner className="size-5" />
						</div>
					) : students.length === 0 ? (
						<p className="text-[12px] text-dashboard-text-muted">
							No active students in this class yet.
						</p>
					) : (
						<ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-dashboard-border/70 p-2">
							{students.map((student) => (
								<li key={student.id}>
									<div className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-dashboard-accent-soft/40">
										<Checkbox
											checked={selectedSet.has(student.id)}
											onCheckedChange={() => toggleStudent(student.id)}
											disabled={disabled}
											aria-label={`Assign ${student.name}`}
										/>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-[13px]">{student.name}</span>
											<span className="text-[11px] text-dashboard-text-muted">{student.code}</span>
										</span>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			) : null}
		</div>
	);
}
