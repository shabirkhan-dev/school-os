"use client";

import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { SelectField } from "@school-os/ui/components/select-field";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@school-os/ui/components/sheet";
import { Textarea } from "@school-os/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AssignTargetPanel } from "@/modules/academics/components/assign-target-panel";
import { useSectionSubjectOptions } from "@/modules/academics/hooks/use-section-subject-options";
import { useCreateAssessmentMutation } from "@/modules/assessments/hooks/use-assessments-queries";
import type {
	AssessmentStatus,
	AssessmentType,
	AssignMode,
} from "@/modules/assessments/types/assessments.types";

const typeOptions = [
	{ label: "Quiz", value: "quiz" },
	{ label: "Test", value: "test" },
	{ label: "Exam", value: "exam" },
];

const statusOptions = [
	{ label: "Draft", value: "draft" },
	{ label: "Published", value: "published" },
];

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenantId: string;
	campusId: string | null;
	sectionId: string;
	sectionSubjectId?: string | null;
	classLabel: string;
	subjectName?: string | null;
};

export function ClassAssessmentScheduleSheet({
	open,
	onOpenChange,
	tenantId,
	campusId,
	sectionId,
	sectionSubjectId: initialSectionSubjectId,
	classLabel,
	subjectName,
}: Props) {
	const router = useRouter();
	const { options: allSectionSubjects, isLoading: sectionSubjectsLoading } =
		useSectionSubjectOptions(tenantId, campusId);
	const createMutation = useCreateAssessmentMutation(tenantId);

	const sectionSubjectOptions = useMemo(
		() => allSectionSubjects.filter((option) => option.sectionId === sectionId),
		[allSectionSubjects, sectionId],
	);

	const [sectionSubjectId, setSectionSubjectId] = useState(initialSectionSubjectId ?? "");
	const [title, setTitle] = useState("");
	const [assessedOn, setAssessedOn] = useState(() => new Date().toLocaleDateString("en-CA"));
	const [startsAt, setStartsAt] = useState("");
	const [durationMinutes, setDurationMinutes] = useState("45");
	const [room, setRoom] = useState("");
	const [instructions, setInstructions] = useState("");
	const [maxScore, setMaxScore] = useState("100");
	const [type, setType] = useState<AssessmentType>("test");
	const [status, setStatus] = useState<AssessmentStatus>("published");
	const [assignMode, setAssignMode] = useState<AssignMode>("whole_class");
	const [studentIds, setStudentIds] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		setError(null);
		setTitle("");
		setAssessedOn(new Date().toLocaleDateString("en-CA"));
		setStartsAt("");
		setDurationMinutes("45");
		setRoom("");
		setInstructions("");
		setMaxScore("100");
		setType("test");
		setStatus("published");
		setAssignMode("whole_class");
		setStudentIds([]);
		const nextSubjectId =
			initialSectionSubjectId ??
			sectionSubjectOptions.find((option) => option.sectionId === sectionId)?.value ??
			"";
		setSectionSubjectId(nextSubjectId);
	}, [open, initialSectionSubjectId, sectionId, sectionSubjectOptions]);

	async function handleSubmit() {
		setError(null);
		if (!sectionSubjectId) {
			setError("Select a subject for this class");
			return;
		}
		if (!title.trim()) {
			setError("Add a title for this assessment");
			return;
		}
		if (assignMode === "selected_students" && studentIds.length === 0) {
			setError("Select at least one student");
			return;
		}

		try {
			const response = await createMutation.mutateAsync({
				sectionSubjectId,
				title: title.trim(),
				assessedOn,
				maxScore: Number(maxScore),
				type,
				status,
				assignMode,
				studentIds: assignMode === "selected_students" ? studentIds : undefined,
				startsAt: startsAt ? new Date(startsAt).toISOString() : null,
				durationMinutes: durationMinutes ? Number(durationMinutes) : null,
				room: room.trim() || null,
				instructions: instructions.trim() || null,
			});
			onOpenChange(false);
			router.push(`/admin/assessments/${response.assessment.id}`);
		} catch (submitError) {
			setError(submitError instanceof Error ? submitError.message : "Could not save assessment");
		}
	}

	const subjectLocked = Boolean(initialSectionSubjectId);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
				<SheetHeader>
					<SheetTitle>Schedule assessment</SheetTitle>
					<SheetDescription>
						{classLabel}
						{subjectName ? ` · ${subjectName}` : ""} — appears on test planner when published.
					</SheetDescription>
				</SheetHeader>

				<FieldGroup className="space-y-4 px-4 py-4">
					{sectionSubjectOptions.length > 1 || !subjectLocked ? (
						<Field>
							<FieldLabel>Class & subject</FieldLabel>
							<SelectField
								items={sectionSubjectOptions.map((option) => ({
									label: option.label,
									value: option.value,
								}))}
								value={sectionSubjectId}
								onValueChange={setSectionSubjectId}
								placeholder={sectionSubjectsLoading ? "Loading…" : "Select subject"}
								disabled={sectionSubjectsLoading || subjectLocked}
							/>
						</Field>
					) : null}

					<Field>
						<FieldLabel>Title</FieldLabel>
						<Input
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="Unit 3 test"
						/>
					</Field>
					<div className="grid gap-3 sm:grid-cols-2">
						<Field>
							<FieldLabel>Type</FieldLabel>
							<SelectField
								items={typeOptions}
								value={type}
								onValueChange={(value) => setType(value as AssessmentType)}
							/>
						</Field>
						<Field>
							<FieldLabel>Assessment date</FieldLabel>
							<Input
								type="date"
								value={assessedOn}
								onChange={(event) => setAssessedOn(event.target.value)}
							/>
						</Field>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<Field>
							<FieldLabel>Start time</FieldLabel>
							<Input
								type="datetime-local"
								value={startsAt}
								onChange={(event) => setStartsAt(event.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel>Duration (min)</FieldLabel>
							<Input
								type="number"
								min={1}
								value={durationMinutes}
								onChange={(event) => setDurationMinutes(event.target.value)}
							/>
						</Field>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<Field>
							<FieldLabel>Max score</FieldLabel>
							<Input
								type="number"
								min={1}
								value={maxScore}
								onChange={(event) => setMaxScore(event.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel>Room</FieldLabel>
							<Input value={room} onChange={(event) => setRoom(event.target.value)} />
						</Field>
					</div>
					<Field>
						<FieldLabel>Instructions</FieldLabel>
						<Textarea
							value={instructions}
							onChange={(event) => setInstructions(event.target.value)}
							rows={3}
						/>
					</Field>

					<AssignTargetPanel
						tenantId={tenantId}
						campusId={campusId}
						sectionId={sectionId}
						assignMode={assignMode}
						studentIds={studentIds}
						onAssignModeChange={setAssignMode}
						onStudentIdsChange={setStudentIds}
					/>

					<Field>
						<FieldLabel>Status</FieldLabel>
						<SelectField
							items={statusOptions}
							value={status}
							onValueChange={(value) => setStatus(value as AssessmentStatus)}
						/>
					</Field>

					{error ? (
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					) : null}
				</FieldGroup>

				<SheetFooter className="border-t px-4 py-3">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={() => void handleSubmit()} disabled={createMutation.isPending}>
						{createMutation.isPending ? "Saving…" : "Schedule assessment"}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
