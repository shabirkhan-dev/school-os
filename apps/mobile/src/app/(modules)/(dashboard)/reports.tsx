import { router } from "expo-router";
import { BarChart3, BookOpen, CalendarCheck, GraduationCap, Users } from "lucide-react-native";
import {
	ActivityIndicator,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile } from "@/components/ui/icon-tile";
import { OSHeader } from "@/components/ui/os-header";
import { PressableScale } from "@/components/ui/pressable-scale";
import { SkeletonStatCard } from "@/components/ui/skeleton";
import { TAB_BAR_CLEARANCE } from "@/components/ui/tab-bar";
import { Colors, Shadows, Tokens, Type } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import {
	useAttendanceReportQuery,
	useGradesReportQuery,
	useHomeworkReportQuery,
	useReportOverviewQuery,
	useTeacherProfileQuery,
} from "@/modules/teacher";
import { MetricCard } from "@/modules/teacher/components/metric-card";
import { ProgressBar } from "@/modules/teacher/components/progress-bar";

export default function ReportsScreen() {
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;

	const overview = useReportOverviewQuery(tenantId);
	const profile = useTeacherProfileQuery(tenantId);
	const sections = profile.data?.accessibleSections ?? [];

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<OSHeader />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.content}
					refreshControl={
						<RefreshControl
							refreshing={overview.isRefetching || profile.isRefetching}
							onRefresh={() => {
								void overview.refetch();
								void profile.refetch();
							}}
							tintColor={Colors.text.muted}
						/>
					}
				>
					<View style={styles.hero}>
						<Text style={styles.title}>Reports</Text>
						<Text style={styles.subtitle}>
							A live snapshot of your classes — grades, attendance, and homework.
						</Text>
					</View>

					{overview.isLoading ? (
						<View style={styles.metrics}>
							<SkeletonStatCard />
							<SkeletonStatCard />
							<SkeletonStatCard />
							<SkeletonStatCard />
						</View>
					) : overview.data ? (
						<View style={styles.metrics}>
							<MetricCard
								label="Students"
								value={overview.data.students}
								hint="Across your sections"
								icon={Users}
							/>
							<MetricCard
								label="Sections"
								value={overview.data.sections}
								hint={`${overview.data.subjects} subjects`}
								icon={BookOpen}
								color={Colors.status.late.fg}
								background={Colors.status.late.bg}
							/>
							<MetricCard
								label="Assessments"
								value={overview.data.assessments}
								hint="Tests & quizzes"
								icon={GraduationCap}
								color={Colors.accent.purple.fg}
								background={Colors.accent.purple.bg}
							/>
							<MetricCard
								label="Attendance"
								value={
									overview.data.attendance.rate != null
										? `${Math.round(overview.data.attendance.rate)}%`
										: "—"
								}
								hint={`${overview.data.attendance.present} of ${overview.data.attendance.marked} marked present`}
								icon={CalendarCheck}
								color={Colors.status.present.fg}
								background={Colors.status.present.bg}
							/>
						</View>
					) : (
						<EmptyState
							icon={BarChart3}
							title="Reports unavailable"
							description="We could not load your report overview."
						/>
					)}

					<Text style={styles.sectionLabel}>CLASS REPORTS</Text>
					{sections.length === 0 ? (
						<EmptyState
							icon={BarChart3}
							title="No classes to report"
							description="Once classes are assigned, their reports appear here."
						/>
					) : (
						<View style={styles.sectionList}>
							{sections.map((section) => (
								<SectionReportCard
									key={section.id}
									tenantId={tenantId}
									sectionId={section.id}
									sectionName={section.name}
									subjectName={section.subjectName}
								/>
							))}
						</View>
					)}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function SectionReportCard({
	tenantId,
	sectionId,
	sectionName,
	subjectName,
}: {
	tenantId: string | null;
	sectionId: string;
	sectionName: string;
	subjectName: string | null;
}) {
	const grades = useGradesReportQuery(tenantId, sectionId);
	const attendance = useAttendanceReportQuery(tenantId, sectionId);
	const homework = useHomeworkReportQuery(tenantId, sectionId);

	const loading = grades.isLoading || attendance.isLoading || homework.isLoading;

	return (
		<PressableScale
			style={styles.sectionCard}
			scaleTo={0.985}
			onPress={() => router.push(`/gradebook/${sectionId}`)}
			accessibilityRole="button"
			accessibilityLabel={`${sectionName} report`}
		>
			<View style={styles.sectionHeader}>
				<IconTile icon={BookOpen} tone="blue" size="md" />
				<View style={styles.sectionCopy}>
					<Text style={styles.sectionName}>{sectionName}</Text>
					<Text style={styles.sectionMeta}>{subjectName ?? "Homeroom"}</Text>
				</View>
			</View>

			{loading ? (
				<View style={styles.cardLoading}>
					<ActivityIndicator color={Colors.text.muted} size="small" />
				</View>
			) : (
				<View style={styles.reportRows}>
					<ReportRow
						label="Average grade"
						value={
							grades.data?.overallAveragePercentage != null
								? `${Math.round(grades.data.overallAveragePercentage)}%`
								: "—"
						}
						progress={grades.data?.overallAveragePercentage ?? null}
						color={Colors.brand.base}
					/>
					<ReportRow
						label="Attendance rate"
						value={
							attendance.data?.attendanceRate != null
								? `${Math.round(attendance.data.attendanceRate)}%`
								: "—"
						}
						progress={attendance.data?.attendanceRate ?? null}
						color={Colors.status.present.solid}
					/>
					<ReportRow
						label="Homework submitted"
						value={
							homework.data?.submissionRate != null
								? `${Math.round(homework.data.submissionRate)}%`
								: "—"
						}
						progress={homework.data?.submissionRate ?? null}
						color={Colors.status.late.solid}
					/>
				</View>
			)}
		</PressableScale>
	);
}

function ReportRow({
	label,
	value,
	progress,
	color,
}: {
	label: string;
	value: string;
	progress: number | null;
	color: string;
}) {
	return (
		<View style={styles.reportRow}>
			<Text style={styles.reportLabel}>{label}</Text>
			<View style={styles.reportBar}>
				{progress != null ? <ProgressBar value={progress} color={color} height={5} /> : null}
			</View>
			<Text style={styles.reportValue}>{value}</Text>
		</View>
	);
}

const GUTTER = Tokens.space["5"];

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.canvas },
	safeArea: { flex: 1 },
	content: { paddingBottom: TAB_BAR_CLEARANCE + Tokens.space["6"] },

	hero: {
		paddingHorizontal: GUTTER,
		paddingTop: Tokens.space["6"],
		paddingBottom: Tokens.space["4"],
	},
	title: Type.display,
	subtitle: {
		...Type.meta,
		color: Colors.text.tertiary,
		marginTop: Tokens.space["1"],
	},

	metrics: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Tokens.space["2.5"],
		paddingHorizontal: GUTTER,
	},

	sectionLabel: {
		...Type.overline,
		paddingHorizontal: GUTTER,
		marginTop: Tokens.space["7"],
		marginBottom: Tokens.space["3"],
	},
	sectionList: { paddingHorizontal: GUTTER, gap: Tokens.space["2.5"] },
	sectionCard: {
		backgroundColor: Colors.surface,
		borderRadius: Tokens.radius.xl,
		padding: Tokens.space["4"],
		...Shadows.xs,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
	},
	sectionCopy: { flex: 1, gap: Tokens.space["1"] },
	sectionName: {
		...Type.subheading,
		fontSize: Tokens.fontSize.lg,
	},
	sectionMeta: Type.caption,

	cardLoading: { alignItems: "center", paddingVertical: Tokens.space["6"] },

	reportRows: {
		gap: Tokens.space["2.5"],
		marginTop: Tokens.space["4"],
		paddingTop: Tokens.space["3"],
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.subtle,
	},
	reportRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
	},
	reportLabel: {
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.medium,
		color: Colors.text.secondary,
		width: 112,
	},
	reportBar: { flex: 1 },
	reportValue: {
		fontSize: Tokens.fontSize.md,
		fontWeight: Tokens.fontWeight.bold,
		color: Colors.text.primary,
		width: 44,
		textAlign: "right",
		fontVariant: ["tabular-nums"],
	},
});
