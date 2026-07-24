"use client";

import { cn } from "@/lib/utils";
import type { DashboardMetrics } from "@/modules/dashboard";

const BAR_W = 4;
const CHART_H = 240;
const PAD_TOP = 14;
const LABEL_H = 26;

const COLOR_DOT = "var(--dashboard-chart-dot)";
const DOT_SIZE = 5;
const DASHED_BG =
	"repeating-linear-gradient(to right, var(--dashboard-chart-leader) 0 2px, transparent 2px 6px)";

const GRID_LEVELS = [0, 0.2, 0.4, 0.6, 0.8, 1];

type Props = {
	grades: DashboardMetrics["gradeRows"];
	className?: string;
};

export function GradeChart({ grades, className }: Props) {
	const maxStudents = Math.max(...grades.map((grade) => grade.students), 1);
	const inner = CHART_H - PAD_TOP - LABEL_H;

	if (grades.length === 0) {
		return (
			<div className={cn("py-10 text-center text-[13px] text-dashboard-text-muted", className)}>
				No grade levels configured yet.
			</div>
		);
	}

	return (
		<div className={cn("flex w-full flex-col", className)}>
			<div className="relative w-full" style={{ height: CHART_H }}>
				{GRID_LEVELS.map((g) => (
					<div
						key={g}
						className="absolute right-0 left-0 flex items-center"
						style={{
							top: PAD_TOP + inner * (1 - g) - DOT_SIZE / 2,
							height: DOT_SIZE,
						}}
					>
						<span
							aria-hidden
							className="shrink-0 rounded-full"
							style={{
								width: DOT_SIZE,
								height: DOT_SIZE,
								backgroundColor: COLOR_DOT,
							}}
						/>
						<span aria-hidden className="h-px flex-1" style={{ backgroundImage: DASHED_BG }} />
					</div>
				))}

				<div
					className="absolute inset-0 flex items-stretch justify-between px-3"
					style={{ paddingTop: PAD_TOP }}
				>
					{grades.map((grade) => (
						<div key={grade.label} className="flex flex-col items-center justify-end">
							<span
								className="rounded-full bg-dashboard-accent transition-colors hover:bg-dashboard-accent-hover"
								style={{
									width: BAR_W,
									height:
										grade.students > 0 ? inner * (0.25 + 0.75 * (grade.students / maxStudents)) : 4,
								}}
								title={`${grade.label}: ${grade.students} students`}
							/>
							<span className="mt-2 max-w-[48px] truncate font-medium text-[10px] text-dashboard-text-dim">
								{grade.label.replace(/^Grade\s+/i, "G")}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
