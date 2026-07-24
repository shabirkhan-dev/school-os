import type {
	DashboardMetrics,
	DashboardOpsPulseItem,
	DashboardStatCard,
} from "../types/dashboard.types";
import type { DashboardTranslator } from "./create-dashboard-translator";

function parseNeedSection(hint: string): number | null {
	const en = hint.match(/(\d+) need section assignment/);
	if (en) return Number(en[1]);
	const ur = hint.match(/(\d+) کو سیکشن/);
	if (ur) return Number(ur[1]);
	return null;
}

function parseOnLeave(hint: string): number | null {
	const en = hint.match(/(\d+) on leave today/);
	if (en) return Number(en[1]);
	const ur = hint.match(/آج (\d+) چھٹی/);
	if (ur) return Number(ur[1]);
	return null;
}

function parseGradeLevels(hint: string): { classes: string; year: string } | null {
	const en = hint.match(/(\d+) grade levels · (.+)/);
	if (en) return { classes: en[1], year: en[2] };
	return null;
}

function parseEmailInvites(hint: string): number | null {
	const en = hint.match(/(\d+) email invite/);
	if (en) return Number(en[1]);
	const ur = hint.match(/(\d+) ای میل/);
	if (ur) return Number(ur[1]);
	return null;
}

export function localizeOpsPulseItems(
	items: DashboardOpsPulseItem[],
	t: DashboardTranslator,
): DashboardOpsPulseItem[] {
	return items.map((item) => {
		switch (item.id) {
			case "students": {
				const unassigned = parseNeedSection(item.hint);
				return {
					...item,
					label: t("opsPulse.activeStudents"),
					hint:
						unassigned !== null && unassigned > 0
							? t("opsPulse.needSection", { count: unassigned })
							: item.hint.includes("sections")
								? t("opsPulse.sectionsThisTerm", {
										count: item.hint.match(/^(\d+)/)?.[1] ?? "0",
									})
								: item.hint,
				};
			}
			case "invites": {
				const pending = parseEmailInvites(item.hint);
				return {
					...item,
					label: t("opsPulse.pendingInvites"),
					hint:
						pending !== null && pending > 0
							? t("opsPulse.emailInvitesOutstanding", {
									count: pending,
									inviteWord: pending === 1 ? t("opsPulse.invite") : t("opsPulse.invites"),
								})
							: t("opsPulse.invitesUpToDate"),
				};
			}
			case "sections": {
				const parsed = parseGradeLevels(item.hint);
				return {
					...item,
					label: t("opsPulse.sections"),
					hint: parsed
						? t("opsPulse.gradeLevels", { classes: parsed.classes, year: parsed.year })
						: item.hint,
				};
			}
			case "staff": {
				const onLeave = parseOnLeave(item.hint);
				return {
					...item,
					label: t("opsPulse.teachersActive"),
					hint:
						onLeave !== null && onLeave > 0
							? t("opsPulse.onLeaveToday", { count: onLeave })
							: t("opsPulse.staffSynced"),
				};
			}
			default:
				return item;
		}
	});
}

const statLabelKey: Record<
	string,
	"stats.totalStudents" | "stats.attendanceToday" | "stats.activeStaff" | "stats.feeCollection"
> = {
	students: "stats.totalStudents",
	attendance: "stats.attendanceToday",
	staff: "stats.activeStaff",
	fees: "stats.feeCollection",
};

export function localizeStatCards(
	stats: DashboardStatCard[],
	t: DashboardTranslator,
): DashboardStatCard[] {
	return stats.map((stat) => {
		const labelKey = statLabelKey[stat.id];
		const next: DashboardStatCard = { ...stat };
		if (labelKey) next.label = t(labelKey);
		if (stat.id === "fees" && stat.unavailable) {
			next.detail = t("stats.feesComingSoon");
			next.trendLabel = t("stats.comingSoon");
		}
		if (stat.id === "staff" && stat.trendLabel === "active teachers") {
			next.trendLabel = t("stats.activeTeachers");
		}
		return next;
	});
}

export function localizeDashboardMetrics(
	metrics: DashboardMetrics,
	t: DashboardTranslator,
): DashboardMetrics {
	return {
		...metrics,
		opsPulse: localizeOpsPulseItems(metrics.opsPulse, t),
		stats: localizeStatCards(metrics.stats, t),
	};
}
