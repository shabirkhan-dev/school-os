import { router } from "expo-router";
import { BookOpen, CalendarPlus, CalendarRange, NotebookPen, RefreshCw } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { OSHeader } from "@/components/ui/os-header";
import { TAB_BAR_CLEARANCE } from "@/components/ui/tab-bar";
import { AppColors } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import type { Assessment, HomeworkAssignment, HomeworkStatus } from "@/modules/teacher";
import { useAssessmentListQuery, useHomeworkListQuery } from "@/modules/teacher";
import { Chip } from "@/modules/teacher/components/chip";
import { ListRow } from "@/modules/teacher/components/list-row";
import { Segmented } from "@/modules/teacher/components/segmented";
import {
	assessmentStatusVariant,
	formatFullDate,
	homeworkStatusVariant,
} from "@/modules/teacher/lib/format";

type Segment = "homework" | "assessments";
type HomeworkFilter = HomeworkStatus | "all";
type AssessmentFilter = "all" | "upcoming" | "past";

export default function WorkScreen() {
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;
	const [segment, setSegment] = useState<Segment>("homework");
	const [homeworkFilter, setHomeworkFilter] = useState<HomeworkFilter>("all");
	const [assessmentFilter, setAssessmentFilter] = useState<AssessmentFilter>("all");

	const homework = useHomeworkListQuery(tenantId);
	const assessments = useAssessmentListQuery(tenantId);

	const filteredHomework = useMemo(() => {
		const items = homework.data?.assignments ?? [];
		if (homeworkFilter === "all") return items;
		return items.filter((item) => item.status === homeworkFilter);
	}, [homework.data, homeworkFilter]);

	const filteredAssessments = useMemo(() => {
		const items = assessments.data?.assessments ?? [];
		if (assessmentFilter === "all") return items;
		const today = new Date().toLocaleDateString("en-CA");
		if (assessmentFilter === "upcoming") return items.filter((item) => item.assessedOn >= today);
		return items.filter((item) => item.assessedOn < today);
	}, [assessments.data, assessmentFilter]);

	const isRefreshing = homework.isRefetching || assessments.isRefetching;
	const active = segment === "homework" ? homework : assessments;

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<OSHeader />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.content}
					refreshControl={
						<RefreshControl
							refreshing={isRefreshing}
							onRefresh={() => {
								void homework.refetch();
								void assessments.refetch();
							}}
							tintColor={AppColors.primary.brand}
						/>
					}
				>
					<Text style={styles.eyebrow}>TEACHER WORKSPACE</Text>
					<Text style={styles.title}>Work</Text>
					<Text style={styles.subtitle}>
						Homework and tests across every class you teach, in one place.
					</Text>

					<View style={styles.segmentWrap}>
						<Segmented
							value={segment}
							onChange={setSegment}
							options={[
								{
									label: `Homework (${homework.data?.assignments.length ?? "…"})`,
									value: "homework",
								},
								{
									label: `Tests (${assessments.data?.assessments.length ?? "…"})`,
									value: "assessments",
								},
							]}
						/>
					</View>

					<View style={styles.filterRow}>
						{segment === "homework"
							? (["all", "draft", "published", "closed"] as HomeworkFilter[]).map((filter) => (
									<Chip
										key={filter}
										label={filter === "all" ? "All" : filter}
										selected={homeworkFilter === filter}
										onPress={() => setHomeworkFilter(filter)}
									/>
								))
							: (["all", "upcoming", "past"] as AssessmentFilter[]).map((filter) => (
									<Chip
										key={filter}
										label={filter === "all" ? "All" : filter}
										selected={assessmentFilter === filter}
										onPress={() => setAssessmentFilter(filter)}
									/>
								))}
						{segment === "assessments" ? (
							<Pressable style={styles.plannerButton} onPress={() => router.push("/planner")}>
								<CalendarRange size={15} color={AppColors.accent.purple} />
								<Text style={styles.plannerText}>Planner</Text>
							</Pressable>
						) : null}
					</View>

					{active.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={AppColors.primary.brand} size="large" />
						</View>
					) : active.isError ? (
						<View style={styles.errorCard}>
							<View style={styles.errorIcon}>
								<RefreshCw size={17} color={AppColors.status.absent} />
							</View>
							<View style={styles.errorCopy}>
								<Text style={styles.errorTitle}>Could not load work</Text>
								<Text style={styles.errorMeta}>Pull down or tap retry.</Text>
							</View>
							<Pressable
								onPress={() => {
									void homework.refetch();
									void assessments.refetch();
								}}
								style={styles.retryButton}
							>
								<RefreshCw size={15} color={AppColors.primary.brand} />
							</Pressable>
						</View>
					) : segment === "homework" && filteredHomework.length > 0 ? (
						<View style={styles.groupCard}>
							{filteredHomework.map((item, index) => (
								<HomeworkRow
									key={item.id}
									item={item}
									last={index === Math.max(0, filteredHomework.length - 1)}
								/>
							))}
						</View>
					) : segment === "assessments" && filteredAssessments.length > 0 ? (
						<View style={styles.groupCard}>
							{filteredAssessments.map((item, index) => (
								<AssessmentRow
									key={item.id}
									item={item}
									last={index === Math.max(0, filteredAssessments.length - 1)}
								/>
							))}
						</View>
					) : (
						<EmptyState
							icon={segment === "homework" ? NotebookPen : CalendarPlus}
							title={
								segment === "homework"
									? homeworkFilter === "all"
										? "No homework yet"
										: `No ${homeworkFilter} homework`
									: assessmentFilter === "all"
										? "No tests yet"
										: `No ${assessmentFilter} tests`
							}
							description={
								segment === "homework"
									? "Assign homework from any of your classes to see it here."
									: "Schedule a test from any of your classes to see it here."
							}
						/>
					)}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function HomeworkRow({ item, last }: { item: HomeworkAssignment; last: boolean }) {
	return (
		<ListRow
			icon={BookOpen}
			iconColor={AppColors.primary.brand}
			iconBackground={AppColors.primary.subtle}
			title={item.title}
			subtitle={`${item.sectionName} · ${item.subjectName}${item.dueAt ? ` · due ${formatFullDate(item.dueAt)}` : ""}`}
			badge={{ label: item.status, status: homeworkStatusVariant[item.status] }}
			last={last}
			onPress={() => router.push(`/homework/${item.id}`)}
		/>
	);
}

function AssessmentRow({ item, last }: { item: Assessment; last: boolean }) {
	return (
		<ListRow
			icon={CalendarPlus}
			iconColor={AppColors.accent.purple}
			iconBackground="#F3E8FF"
			title={item.title}
			subtitle={`${item.sectionName} · ${formatFullDate(item.assessedOn)} · max ${item.maxScore}`}
			badge={{ label: item.status, status: assessmentStatusVariant[item.status] }}
			last={last}
			onPress={() => router.push(`/assessment/${item.id}`)}
		/>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	content: { padding: 20, paddingBottom: TAB_BAR_CLEARANCE + 24 },
	eyebrow: { color: AppColors.primary.brand, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
	title: {
		color: AppColors.text.primary,
		fontSize: 30,
		fontWeight: "800",
		marginTop: 4,
		letterSpacing: -0.8,
	},
	subtitle: { color: AppColors.text.secondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
	segmentWrap: { marginTop: 20 },
	filterRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		gap: 8,
		marginTop: 14,
	},
	plannerButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginLeft: "auto",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#E9D5FF",
		backgroundColor: "#FAF5FF",
	},
	plannerText: { color: AppColors.accent.purple, fontSize: 13, fontWeight: "700" },
	loading: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
	errorCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
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
	groupCard: {
		marginTop: 14,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
	},
});
