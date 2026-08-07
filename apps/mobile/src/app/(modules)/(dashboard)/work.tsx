import { router } from "expo-router";
import { BookOpen, CalendarPlus, CalendarRange, NotebookPen, RefreshCw } from "lucide-react-native";
import { useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { OSHeader } from "@/components/ui/os-header";
import { PressableScale } from "@/components/ui/pressable-scale";
import { SkeletonRow } from "@/components/ui/skeleton";
import { TAB_BAR_CLEARANCE } from "@/components/ui/tab-bar";
import { Colors, Shadows, Tokens, Type } from "@/constants/design-system";
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
							tintColor={Colors.text.muted}
						/>
					}
				>
					<View style={styles.hero}>
						<Text style={styles.title}>Work</Text>
						<Text style={styles.subtitle}>Homework and tests across every class you teach.</Text>
					</View>

					<View style={styles.controls}>
						<Segmented
							value={segment}
							onChange={setSegment}
							options={[
								{
									label: `Homework${homework.data ? ` (${homework.data.assignments.length})` : ""}`,
									value: "homework",
								},
								{
									label: `Tests${assessments.data ? ` (${assessments.data.assessments.length})` : ""}`,
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
							<PressableScale
								style={styles.plannerButton}
								scaleTo={0.95}
								onPress={() => router.push("/planner")}
								accessibilityRole="button"
								accessibilityLabel="Open test planner"
							>
								<CalendarRange size={14} color={Colors.accent.purple.fg} strokeWidth={2.2} />
								<Text style={styles.plannerText}>Planner</Text>
							</PressableScale>
						) : null}
					</View>

					{active.isLoading ? (
						<View style={styles.stack}>
							<SkeletonRow />
							<SkeletonRow />
							<SkeletonRow />
						</View>
					) : active.isError ? (
						<View style={styles.errorCard}>
							<IconTile icon={RefreshCw} tone="rose" size="md" />
							<View style={styles.errorCopy}>
								<Text style={styles.errorTitle}>Could not load work</Text>
								<Text style={styles.errorMeta}>Pull down or tap retry.</Text>
							</View>
							<PressableScale
								style={styles.retryButton}
								scaleTo={0.92}
								onPress={() => {
									void homework.refetch();
									void assessments.refetch();
								}}
								accessibilityRole="button"
								accessibilityLabel="Retry"
							>
								<RefreshCw size={15} color={Colors.text.secondary} strokeWidth={2.2} />
							</PressableScale>
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
			iconColor={Colors.brand.base}
			iconBackground={Colors.brand.tint}
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
			iconColor={Colors.accent.purple.fg}
			iconBackground={Colors.accent.purple.bg}
			title={item.title}
			subtitle={`${item.sectionName} · ${formatFullDate(item.assessedOn)} · max ${item.maxScore}`}
			badge={{ label: item.status, status: assessmentStatusVariant[item.status] }}
			last={last}
			onPress={() => router.push(`/assessment/${item.id}`)}
		/>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.canvas },
	safeArea: { flex: 1 },
	content: { paddingBottom: TAB_BAR_CLEARANCE + Tokens.space["6"] },

	hero: {
		paddingHorizontal: Tokens.space["5"],
		paddingTop: Tokens.space["6"],
		paddingBottom: Tokens.space["3"],
	},
	title: Type.display,
	subtitle: {
		...Type.meta,
		color: Colors.text.tertiary,
		marginTop: Tokens.space["1"],
	},

	controls: {
		paddingHorizontal: Tokens.space["5"],
		marginTop: Tokens.space["4"],
	},

	filterRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		gap: Tokens.space["2"],
		paddingHorizontal: Tokens.space["5"],
		marginTop: Tokens.space["3"],
	},
	plannerButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["1.5"],
		marginLeft: "auto",
		paddingHorizontal: Tokens.space["3"],
		paddingVertical: Tokens.space["2"],
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.accent.purple.bg,
	},
	plannerText: {
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
		color: Colors.accent.purple.fg,
		letterSpacing: Tokens.tracking.snug,
	},

	stack: {
		paddingHorizontal: Tokens.space["5"],
		marginTop: Tokens.space["4"],
		gap: Tokens.space["2.5"],
	},

	errorCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		marginHorizontal: Tokens.space["5"],
		marginTop: Tokens.space["4"],
		padding: Tokens.space["4"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		...Shadows.xs,
	},
	errorCopy: { flex: 1, gap: Tokens.space["1"] },
	errorTitle: {
		...Type.subheading,
		fontSize: Tokens.fontSize.lg,
	},
	errorMeta: Type.caption,
	retryButton: {
		width: 38,
		height: 38,
		borderRadius: Tokens.radius.full,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.sunken,
	},

	groupCard: {
		marginHorizontal: Tokens.space["5"],
		marginTop: Tokens.space["4"],
		backgroundColor: Colors.surface,
		borderRadius: Tokens.radius.xl,
		overflow: "hidden",
		...Shadows.xs,
	},
});
