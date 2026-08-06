import { router } from "expo-router";
import { BarChart3, BookOpen, CalendarCheck, GraduationCap, Users } from "lucide-react-native";
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
import { AppColors, AppShadows } from "@/constants/design-system";
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
							tintColor={AppColors.primary.brand}
						/>
					}
				>
					<Text style={styles.eyebrow}>SCHOOL PULSE</Text>
					<Text style={styles.title}>Reports</Text>
					<Text style={styles.subtitle}>
						A live snapshot of your classes — grades, attendance, and homework completion.
					</Text>

					{overview.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={AppColors.primary.brand} size="large" />
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
								color={AppColors.status.late}
								background={AppColors.status.lateBg}
							/>
							<MetricCard
								label="Assessments"
								value={overview.data.assessments}
								hint="Tests & quizzes"
								icon={GraduationCap}
								color={AppColors.accent.purple}
								background="#F3E8FF"
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
								color={AppColors.status.present}
								background={AppColors.status.presentBg}
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
		<Pressable
			style={({ pressed }) => [styles.sectionCard, pressed && styles.pressed]}
			onPress={() => router.push(`/gradebook/${sectionId}`)}
		>
			<View style={styles.sectionHeader}>
				<View style={styles.sectionIcon}>
					<BookOpen size={18} color={AppColors.primary.brand} />
				</View>
				<View style={styles.sectionCopy}>
					<Text style={styles.sectionName}>{sectionName}</Text>
					<Text style={styles.sectionMeta}>{subjectName ?? "Homeroom"}</Text>
				</View>
				<Text style={styles.sectionArrow}>→</Text>
			</View>

			{loading ? (
				<View style={styles.cardLoading}>
					<ActivityIndicator color={AppColors.primary.brand} size="small" />
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
						color={AppColors.primary.brand}
					/>
					<ReportRow
						label="Attendance rate"
						value={
							attendance.data?.attendanceRate != null
								? `${Math.round(attendance.data.attendanceRate)}%`
								: "—"
						}
						progress={attendance.data?.attendanceRate ?? null}
						color={AppColors.status.present}
					/>
					<ReportRow
						label="Homework submitted"
						value={
							homework.data?.submissionRate != null
								? `${Math.round(homework.data.submissionRate)}%`
								: "—"
						}
						progress={homework.data?.submissionRate ?? null}
						color={AppColors.status.late}
					/>
				</View>
			)}
		</Pressable>
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
	loading: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
	metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 20 },
	sectionLabel: {
		color: AppColors.text.muted,
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 1,
		marginTop: 26,
		marginBottom: 12,
	},
	sectionList: { gap: 12 },
	sectionCard: {
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		padding: 14,
		...AppShadows.sm,
	},
	pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
	sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
	sectionIcon: {
		width: 38,
		height: 38,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	sectionCopy: { flex: 1, gap: 2 },
	sectionName: { color: AppColors.text.primary, fontSize: 15, fontWeight: "700" },
	sectionMeta: { color: AppColors.text.secondary, fontSize: 12 },
	sectionArrow: { color: AppColors.text.muted, fontSize: 16 },
	cardLoading: { alignItems: "center", paddingVertical: 24 },
	reportRows: {
		gap: 10,
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	reportRow: { flexDirection: "row", alignItems: "center", gap: 10 },
	reportLabel: { color: AppColors.text.secondary, fontSize: 12, width: 116 },
	reportBar: { flex: 1 },
	reportValue: {
		color: AppColors.text.primary,
		fontSize: 13,
		fontWeight: "800",
		width: 42,
		textAlign: "right",
	},
});
