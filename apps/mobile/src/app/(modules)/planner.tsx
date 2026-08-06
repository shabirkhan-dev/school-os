import { router } from "expo-router";
import { CalendarRange, RefreshCw } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColors, AppShadows } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import type { Assessment } from "@/modules/teacher";
import { useAssessmentPlannerQuery } from "@/modules/teacher";
import { ScreenHeader } from "@/modules/teacher/components/screen-header";
import { assessmentStatusVariant, assessmentTypeLabel } from "@/modules/teacher/lib/format";

const WEEK_COUNT = 5;

export default function PlannerScreen() {
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;

	const weeks = useMemo(() => buildWeeks(new Date(), WEEK_COUNT), []);
	const from = useMemo(() => toIso(weeks[0].start), [weeks]);
	const to = useMemo(() => toIso(weeks[weeks.length - 1].end), [weeks]);
	const planner = useAssessmentPlannerQuery(tenantId, from, to);

	const assessmentsByWeek = useMemo(() => {
		const map = new Map<string, Assessment[]>();
		for (const week of weeks) {
			map.set(week.key, []);
		}
		for (const item of planner.data?.assessments ?? []) {
			const week = weeks.find(
				(w) => item.assessedOn >= toIso(w.start) && item.assessedOn <= toIso(w.end),
			);
			if (week) map.get(week.key)?.push(item);
		}
		return map;
	}, [planner.data, weeks]);

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<ScreenHeader
					title="Test planner"
					subtitle={`Next ${WEEK_COUNT} weeks of quizzes, tests & exams`}
				/>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
					{planner.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={AppColors.primary.brand} size="large" />
							<Text style={styles.loadingText}>Loading your calendar…</Text>
						</View>
					) : planner.isError ? (
						<View style={styles.errorCard}>
							<View style={styles.errorIcon}>
								<RefreshCw size={17} color={AppColors.status.absent} />
							</View>
							<View style={styles.errorCopy}>
								<Text style={styles.errorTitle}>Planner unavailable</Text>
								<Text style={styles.errorMeta}>We could not load upcoming tests.</Text>
							</View>
							<Pressable onPress={() => void planner.refetch()} style={styles.retryButton}>
								<RefreshCw size={15} color={AppColors.primary.brand} />
							</Pressable>
						</View>
					) : (planner.data?.assessments.length ?? 0) === 0 ? (
						<EmptyState
							icon={CalendarRange}
							title="No tests scheduled"
							description="Nothing planned in the next five weeks. Schedule a test from any class."
						/>
					) : (
						weeks.map((week) => {
							const items = assessmentsByWeek.get(week.key) ?? [];
							if (items.length === 0) return null;
							return (
								<View key={week.key} style={styles.weekSection}>
									<View style={styles.weekHeader}>
										<Text style={styles.weekLabel}>{week.label}</Text>
										<Text style={styles.weekCount}>
											{items.length} test{items.length === 1 ? "" : "s"}
										</Text>
									</View>
									<View style={styles.weekCard}>
										{items.map((item, index) => (
											<Pressable
												key={item.id}
												style={({ pressed }) => [
													styles.assessmentRow,
													index > 0 && styles.rowDivider,
													pressed && styles.pressedRow,
												]}
												onPress={() => router.push(`/assessment/${item.id}`)}
											>
												<View style={styles.datePill}>
													<Text style={styles.dateDay}>
														{new Date(`${item.assessedOn}T12:00:00`).getDate()}
													</Text>
													<Text style={styles.dateMonth}>
														{new Date(`${item.assessedOn}T12:00:00`).toLocaleDateString(undefined, {
															month: "short",
														})}
													</Text>
												</View>
												<View style={styles.assessmentCopy}>
													<Text style={styles.assessmentTitle}>{item.title}</Text>
													<Text style={styles.assessmentMeta}>
														{assessmentTypeLabel[item.type]} · {item.sectionName}
														{item.subjectCode ? ` · ${item.subjectCode}` : ""}
													</Text>
												</View>
												<StatusBadge
													label={item.status}
													status={assessmentStatusVariant[item.status]}
													size="sm"
												/>
											</Pressable>
										))}
									</View>
								</View>
							);
						})
					)}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function buildWeeks(
	from: Date,
	count: number,
): Array<{ key: string; label: string; start: Date; end: Date }> {
	const start = new Date(from);
	const day = start.getDay();
	start.setDate(start.getDate() - ((day + 6) % 7)); // back to Monday
	const weeks: Array<{ key: string; label: string; start: Date; end: Date }> = [];
	for (let i = 0; i < count; i += 1) {
		const weekStart = new Date(start);
		weekStart.setDate(weekStart.getDate() + i * 7);
		const weekEnd = new Date(weekStart);
		weekEnd.setDate(weekEnd.getDate() + 6);
		weeks.push({
			key: toIso(weekStart),
			label: `${formatShort(weekStart)} – ${formatShort(weekEnd)}`,
			start: weekStart,
			end: weekEnd,
		});
	}
	return weeks;
}

function toIso(date: Date): string {
	// Manual local ISO (YYYY-MM-DD): toLocaleDateString("en-CA") can fall back to
	// the device locale on Android without full ICU and break API validation.
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function formatShort(date: Date): string {
	return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	content: { paddingBottom: 48 },
	loading: { alignItems: "center", gap: 10, paddingVertical: 70 },
	loadingText: { color: AppColors.text.secondary, fontSize: 13 },
	errorCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginHorizontal: 16,
		marginTop: 20,
		padding: 14,
		borderRadius: 16,
		backgroundColor: AppColors.surface,
		borderWidth: 1,
		borderColor: AppColors.status.absentBg,
	},
	errorIcon: {
		width: 36,
		height: 36,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.status.absentBg,
	},
	errorCopy: { flex: 1, gap: 2 },
	errorTitle: { color: AppColors.text.primary, fontWeight: "700", fontSize: 14 },
	errorMeta: { color: AppColors.text.secondary, fontSize: 12 },
	retryButton: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	weekSection: { marginTop: 20 },
	weekHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	weekLabel: {
		color: AppColors.text.primary,
		fontSize: 15,
		fontWeight: "800",
		letterSpacing: -0.2,
	},
	weekCount: { color: AppColors.text.muted, fontSize: 12, fontWeight: "600" },
	weekCard: {
		marginHorizontal: 16,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
		...AppShadows.sm,
	},
	assessmentRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	rowDivider: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	pressedRow: { opacity: 0.7 },
	datePill: {
		width: 44,
		height: 46,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	dateDay: { color: AppColors.primary.brand, fontSize: 17, fontWeight: "800" },
	dateMonth: {
		color: AppColors.primary.brand,
		fontSize: 10,
		fontWeight: "700",
		textTransform: "uppercase",
	},
	assessmentCopy: { flex: 1, gap: 2 },
	assessmentTitle: { color: AppColors.text.primary, fontSize: 14, fontWeight: "700" },
	assessmentMeta: { color: AppColors.text.secondary, fontSize: 12 },
});
