import { router } from "expo-router";
import { AlertTriangle, BookOpen, GraduationCap, RefreshCw, Users } from "lucide-react-native";
import { useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { MetaRow } from "@/components/ui/meta-row";
import { OSHeader } from "@/components/ui/os-header";
import { PressableScale } from "@/components/ui/pressable-scale";
import { SkeletonRow } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { TAB_BAR_CLEARANCE } from "@/components/ui/tab-bar";
import { Colors, Shadows, Tokens, Type } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import type { TeacherDashboardSection } from "@/modules/staff";
import { useMyTeacherDashboardQuery } from "@/modules/staff";

export default function ClassesScreen() {
	const { tenantContext } = useAuth();
	const date = useMemo(todayIso, []);
	const isTeacher = tenantContext?.role === "teacher";

	const dashboard = useMyTeacherDashboardQuery(
		isTeacher ? (tenantContext?.tenantId ?? null) : null,
		date,
	);

	const sections = dashboard.data?.sections ?? [];
	const pending = sections.filter((item) => !item.todayAttendance.isComplete).length;

	return (
		<View style={styles.screen}>
			<SafeAreaView edges={["top"]} style={styles.flex}>
				<OSHeader />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scroll}
					refreshControl={
						<RefreshControl
							refreshing={dashboard.isRefetching}
							onRefresh={() => void dashboard.refetch()}
							tintColor={Colors.text.muted}
						/>
					}
				>
					<View style={styles.hero}>
						<Text style={styles.title}>Your classes</Text>
						<Text style={styles.subtitle}>
							{sections.length > 0
								? `${sections.length} section${sections.length === 1 ? "" : "s"}${pending > 0 ? ` · ${pending} still to mark` : " · all marked today"}`
								: "Every section you teach, with today's attendance."}
						</Text>
					</View>

					{!tenantContext || !isTeacher ? (
						<EmptyState
							icon={GraduationCap}
							title={
								!tenantContext ? "Organization setup required" : "Teacher workspace coming next"
							}
							description={
								!tenantContext
									? "Connect your account to a school organization to see classes."
									: "This release focuses on the teacher workspace."
							}
						/>
					) : dashboard.isLoading ? (
						<View style={styles.stack}>
							<SkeletonRow />
							<SkeletonRow />
							<SkeletonRow />
							<SkeletonRow />
						</View>
					) : dashboard.isError ? (
						<ErrorCard onRetry={() => void dashboard.refetch()} />
					) : sections.length > 0 ? (
						<View style={styles.stack}>
							{sections.map((item) => (
								<ClassCard
									key={`${item.section.id}-${item.section.subjectId ?? "homeroom"}`}
									item={item}
								/>
							))}
						</View>
					) : (
						<EmptyState
							icon={GraduationCap}
							title="No classes yet"
							description="Your assigned sections appear here once your school connects them to your account."
						/>
					)}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

/**
 * Class card. Attendance is summarised as a breakdown strip rather than a
 * sentence, so a teacher scanning the column compares like against like.
 */
function ClassCard({ item }: { item: TeacherDashboardSection }) {
	const { summary, isComplete } = item.todayAttendance;

	return (
		<PressableScale
			style={styles.card}
			scaleTo={0.985}
			onPress={() => router.push(`/class/${item.section.id}`)}
			accessibilityRole="button"
			accessibilityLabel={`${item.section.name}, ${isComplete ? "marked" : "needs marking"}`}
		>
			<View
				style={[
					styles.accent,
					{
						backgroundColor: isComplete ? Colors.status.present.solid : Colors.status.late.solid,
					},
				]}
			/>

			<View style={styles.cardHead}>
				<IconTile icon={BookOpen} tone={isComplete ? "green" : "amber"} size="md" />
				<View style={styles.cardCopy}>
					<Text style={styles.cardTitle} numberOfLines={1}>
						{item.section.name}
					</Text>
					<MetaRow
						items={[
							{ value: item.section.subjectName ?? "Homeroom" },
							{ icon: Users, value: `${item.studentCount}` },
						]}
					/>
				</View>
				<StatusBadge
					label={isComplete ? "Marked" : "Pending"}
					status={isComplete ? "present" : "pending"}
					size="sm"
				/>
			</View>

			{summary ? (
				<View style={styles.breakdown}>
					<Tally label="Present" value={summary.present} tone={Colors.status.present.fg} />
					<Tally label="Absent" value={summary.absent} tone={Colors.status.absent.fg} />
					<Tally label="Late" value={summary.late} tone={Colors.status.late.fg} />
					{summary.attendanceRate != null ? (
						<Tally
							label="Rate"
							value={`${Math.round(summary.attendanceRate)}%`}
							tone={Colors.text.primary}
						/>
					) : null}
				</View>
			) : null}
		</PressableScale>
	);
}

function Tally({ label, value, tone }: { label: string; value: number | string; tone: string }) {
	return (
		<View style={styles.tally}>
			<Text style={[styles.tallyValue, { color: tone }]}>{value}</Text>
			<Text style={styles.tallyLabel}>{label}</Text>
		</View>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<View style={styles.errorCard}>
			<IconTile icon={AlertTriangle} tone="rose" size="md" />
			<View style={styles.cardCopy}>
				<Text style={styles.cardTitle}>Classes unavailable</Text>
				<Text style={styles.errorBody}>We couldn't load your class list.</Text>
			</View>
			<PressableScale
				style={styles.retry}
				scaleTo={0.92}
				onPress={onRetry}
				accessibilityRole="button"
				accessibilityLabel="Retry"
			>
				<RefreshCw size={16} color={Colors.text.secondary} strokeWidth={2.2} />
			</PressableScale>
		</View>
	);
}

function todayIso(): string {
	return new Date().toLocaleDateString("en-CA");
}

const GUTTER = Tokens.space["5"];

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: Colors.canvas },
	flex: { flex: 1 },
	scroll: { paddingBottom: TAB_BAR_CLEARANCE + Tokens.space["6"] },

	hero: {
		paddingHorizontal: GUTTER,
		paddingTop: Tokens.space["6"],
		paddingBottom: Tokens.space["5"],
	},
	title: Type.display,
	subtitle: {
		...Type.meta,
		color: Colors.text.tertiary,
		marginTop: Tokens.space["1"],
	},

	stack: { paddingHorizontal: GUTTER, gap: Tokens.space["2.5"] },

	card: {
		padding: Tokens.space["4"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		overflow: "hidden",
		...Shadows.xs,
	},
	accent: {
		position: "absolute",
		left: 0,
		top: Tokens.space["4"],
		bottom: Tokens.space["4"],
		width: 3,
		borderTopRightRadius: Tokens.radius.full,
		borderBottomRightRadius: Tokens.radius.full,
	},
	cardHead: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
	},
	cardCopy: { flex: 1, gap: Tokens.space["1"] },
	cardTitle: {
		...Type.subheading,
		fontSize: Tokens.fontSize.lg,
	},

	breakdown: {
		flexDirection: "row",
		marginTop: Tokens.space["4"],
		paddingTop: Tokens.space["3"],
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.subtle,
	},
	tally: { flex: 1, gap: Tokens.space["0.5"] },
	tallyValue: {
		fontSize: Tokens.fontSize["2xl"],
		fontWeight: Tokens.fontWeight.bold,
		letterSpacing: Tokens.tracking.tight,
		fontVariant: ["tabular-nums"],
	},
	tallyLabel: {
		...Type.overline,
		fontSize: Tokens.fontSize["2xs"],
	},

	errorCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		marginHorizontal: GUTTER,
		padding: Tokens.space["4"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		...Shadows.xs,
	},
	errorBody: Type.caption,
	retry: {
		width: 38,
		height: 38,
		borderRadius: Tokens.radius.full,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.sunken,
	},
});
