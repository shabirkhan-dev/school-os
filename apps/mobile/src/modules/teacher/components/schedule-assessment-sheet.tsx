import { useState } from "react";
import { View } from "react-native";
import { useCreateAssessmentMutation } from "../hooks/use-teacher-mutations";
import { localSessionDate } from "../lib/format";
import type { AssessmentType } from "../types/assessment.types";
import { Chip } from "./chip";
import { FormSheet } from "./form-sheet";
import { TextField } from "./text-field";

interface ScheduleAssessmentSheetProps {
	visible: boolean;
	onClose: () => void;
	tenantId: string | null;
	sectionSubjectId: string;
}

const TYPE_OPTIONS: Array<{ label: string; value: AssessmentType }> = [
	{ label: "Quiz", value: "quiz" },
	{ label: "Test", value: "test" },
	{ label: "Exam", value: "exam" },
];

export function ScheduleAssessmentSheet({
	visible,
	onClose,
	tenantId,
	sectionSubjectId,
}: ScheduleAssessmentSheetProps) {
	const [title, setTitle] = useState("");
	const [type, setType] = useState<AssessmentType>("test");
	const [assessedOn, setAssessedOn] = useState("");
	const [maxScore, setMaxScore] = useState("");
	const [duration, setDuration] = useState("");
	const [room, setRoom] = useState("");
	const createAssessment = useCreateAssessmentMutation(tenantId);

	const canSubmit = title.trim().length > 0 && !createAssessment.isPending;

	const handleSubmit = async () => {
		if (!canSubmit) return;
		try {
			await createAssessment.mutateAsync({
				sectionSubjectId,
				title: title.trim(),
				type,
				assessedOn: assessedOn.trim() || localSessionDate(),
				...(maxScore.trim() ? { maxScore: Number(maxScore) } : {}),
				...(duration.trim() ? { durationMinutes: Number(duration) } : {}),
				...(room.trim() ? { room: room.trim() } : {}),
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
		setType("test");
		setAssessedOn("");
		setMaxScore("");
		setDuration("");
		setRoom("");
	};

	return (
		<FormSheet
			visible={visible}
			title="Schedule a test"
			subtitle="Set up a quiz, test, or exam for this class."
			onClose={() => {
				reset();
				onClose();
			}}
			onSubmit={() => void handleSubmit()}
			submitLabel={createAssessment.isPending ? "Scheduling…" : "Schedule test"}
			loading={createAssessment.isPending}
		>
			<TextField
				label="Title"
				placeholder="e.g. Mid-term Mathematics"
				value={title}
				onChangeText={setTitle}
				autoCapitalize="sentences"
			/>
			<View style={{ gap: 6 }}>
				<View style={{ flexDirection: "row", gap: 8 }}>
					{TYPE_OPTIONS.map((option) => (
						<Chip
							key={option.value}
							label={option.label}
							selected={type === option.value}
							accent={accentForType(option.value)}
							onPress={() => setType(option.value)}
						/>
					))}
				</View>
			</View>
			<TextField
				label="Date (YYYY-MM-DD)"
				placeholder={localSessionDate()}
				value={assessedOn}
				onChangeText={setAssessedOn}
				autoCapitalize="none"
				keyboardType="numbers-and-punctuation"
			/>
			<TextField
				label="Maximum score"
				placeholder="e.g. 50"
				value={maxScore}
				onChangeText={setMaxScore}
				keyboardType="number-pad"
			/>
			<TextField
				label="Duration (minutes)"
				placeholder="e.g. 60"
				value={duration}
				onChangeText={setDuration}
				keyboardType="number-pad"
			/>
			<TextField
				label="Room"
				placeholder="e.g. Lab 3"
				value={room}
				onChangeText={setRoom}
				autoCapitalize="words"
			/>
		</FormSheet>
	);
}

function accentForType(type: AssessmentType): string {
	switch (type) {
		case "quiz":
			return "#7C3AED";
		case "test":
			return "#2563EB";
		case "exam":
			return "#0D9488";
	}
}
