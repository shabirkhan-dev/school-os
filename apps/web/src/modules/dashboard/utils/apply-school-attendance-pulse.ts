import type { SchoolDayPulse } from "@/modules/attendance/types/attendance.types";
import type { DashboardMetrics } from "../types/dashboard.types";

export function applySchoolAttendancePulse(
	metrics: DashboardMetrics,
	pulse: SchoolDayPulse,
): DashboardMetrics {
	const stats = metrics.stats.map((stat) => {
		if (stat.id !== "attendance") return stat;
		if (pulse.sessionsCount === 0) {
			return {
				...stat,
				unavailable: false,
				value: 0,
				formatValue: () => "—",
				detail: "No attendance sessions recorded for today yet",
				trend: "flat" as const,
				trendDelta: "0",
				trendLabel: "sessions today",
			};
		}

		const rate = pulse.attendanceRate;
		return {
			...stat,
			unavailable: false,
			value: rate ?? 0,
			formatValue: (value: number) => (rate === null ? "—" : `${value}%`),
			detail: `${pulse.sessionsCount} session${pulse.sessionsCount === 1 ? "" : "s"} · ${pulse.summary.total} marks · ${pulse.sectionsWithSessions} section${pulse.sectionsWithSessions === 1 ? "" : "s"}`,
			trend: rate !== null && rate >= 90 ? ("up" as const) : ("flat" as const),
			trendDelta: rate === null ? "—" : `${rate}%`,
			trendLabel: "present + late + excused",
		};
	});

	return { ...metrics, stats };
}
