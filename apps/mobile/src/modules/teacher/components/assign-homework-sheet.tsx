import { useState } from "react";
import { useCreateHomeworkMutation } from "../hooks/use-teacher-mutations";
import { localSessionDate } from "../lib/format";
import { FormSheet } from "./form-sheet";
import { TextField } from "./text-field";

interface AssignHomeworkSheetProps {
	visible: boolean;
	onClose: () => void;
	tenantId: string | null;
	sectionSubjectId: string;
}

export function AssignHomeworkSheet({
	visible,
	onClose,
	tenantId,
	sectionSubjectId,
}: AssignHomeworkSheetProps) {
	const [title, setTitle] = useState("");
	const [dueAt, setDueAt] = useState("");
	const [minutes, setMinutes] = useState("");
	const [description, setDescription] = useState("");
	const createHomework = useCreateHomeworkMutation(tenantId);

	const canSubmit = title.trim().length > 0 && !createHomework.isPending;

	const handleSubmit = async () => {
		if (!canSubmit) return;
		try {
			await createHomework.mutateAsync({
				sectionSubjectId,
				title: title.trim(),
				...(dueAt.trim() ? { dueAt: dueAt.trim() } : {}),
				...(minutes.trim() ? { estimatedMinutes: Number(minutes) } : {}),
				...(description.trim() ? { description: description.trim() } : {}),
				status: "published",
				assignMode: "whole_class",
			});
			reset();
			onClose();
		} catch {
			// Error surfaced by the mutation; sheet stays open to retry.
		}
	};

	const reset = () => {
		setTitle("");
		setDueAt("");
		setMinutes("");
		setDescription("");
	};

	return (
		<FormSheet
			visible={visible}
			title="Assign homework"
			subtitle="Published to the whole class right away."
			onClose={() => {
				reset();
				onClose();
			}}
			onSubmit={() => void handleSubmit()}
			submitLabel={createHomework.isPending ? "Assigning…" : "Assign homework"}
			loading={createHomework.isPending}
		>
			<TextField
				label="Title"
				placeholder="e.g. Chapter 4 — Algebra practice"
				value={title}
				onChangeText={setTitle}
				autoCapitalize="sentences"
			/>
			<TextField
				label="Due date (YYYY-MM-DD)"
				placeholder={localSessionDate()}
				value={dueAt}
				onChangeText={setDueAt}
				autoCapitalize="none"
				keyboardType="numbers-and-punctuation"
			/>
			<TextField
				label="Estimated time (minutes)"
				placeholder="e.g. 45"
				value={minutes}
				onChangeText={setMinutes}
				keyboardType="number-pad"
			/>
			<TextField
				label="Instructions"
				placeholder="What should students complete?"
				value={description}
				onChangeText={setDescription}
				multiline
				numberOfLines={4}
				textAlignVertical="top"
			/>
		</FormSheet>
	);
}
