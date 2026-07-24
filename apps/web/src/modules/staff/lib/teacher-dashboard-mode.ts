export type TeacherDashboardMode = "teaching" | "grading" | "communication" | "planning";

export type TeacherDashboardModeMeta = {
	mode: TeacherDashboardMode;
	label: string;
	hint: string;
};

export function resolveTeacherDashboardMode(hour: number): TeacherDashboardModeMeta {
	if (hour >= 8 && hour < 14) {
		return {
			mode: "teaching",
			label: "Teaching mode",
			hint: "Timetable and quick attendance first",
		};
	}
	if (hour >= 14 && hour < 17) {
		return {
			mode: "grading",
			label: "Grading mode",
			hint: "Homework, tests, and marks",
		};
	}
	if (hour >= 17 && hour < 20) {
		return {
			mode: "communication",
			label: "Communication mode",
			hint: "Parents, summaries, and follow-ups",
		};
	}
	return {
		mode: "planning",
		label: "Planning mode",
		hint: "Tomorrow and the week ahead",
	};
}

export function isQuietHours(hour: number): boolean {
	return hour >= 20 || hour < 6;
}
