import { useLocalSearchParams } from "expo-router";
import { CalendarCheck, GraduationCap, Trophy, Users } from "lucide-react-native";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import type { AttendanceMarkStatus } from "@/modules/teacher";
import { useStudentAttendanceHistoryQuery, useStudentReportQuery } from "@/modules/teacher";
import { ListRow } from "@/modules/teacher/components/list-row";
import { ScreenHeader } from "@/modules/teacher/components/screen-header";
import {
	attendanceStatusBackground,
	attendanceStatusColor,
	attendanceStatusLabel,
	attendanceStatusVariant,
	formatDate,
} from "@/modules/teacher/lib/format";

export default function StudentProfileScreen() {
	const { studentId, name } = useLocalSearchParams<{ studentId: string; name?: string }>();
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;

	const attendance = useStudentAttendanceHistoryQuery(tenantId, studentId);
	const report = useStudentReportQuery(tenantId, studentId);

	const history = attendance.data?.history ?? [];
	const entries = report.data?.entries ?? [];
	const studentName = name || report.data?.student.name || "Student";

	const attendanceSummary = history.reduce(
		(acc, item) => {
			acc[item.mark.status] += 1;
			return acc;
		},
		{ present: 0, absent: 0, late: 0, excused: 0, left_early: 0, unknown: 0 } as Record<
			AttendanceMarkStatus,
			number
		>,
	);

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<ScreenHeader title="Student" subtitle={report.data?.student.studentCode ?? "Profile"} />
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
					<View style={styles.profileCard}>
						<Image
							source={{ uri: `https://avatar.vercel.sh/${encodeURIComponent(studentId)}` }}
							style={styles.avatar}
						/>
						<View style={styles.profileCopy}>
							<Text style={styles.profileName}>{studentName}</Text>
							<Text style={styles.profileMeta}>
								{report.data?.student.studentCode ?? "Student"}
							</Text>
						</View>
						<StatusBadge label="Enrolled" status="present" size="sm" />
					</View>

					<Text style={styles.sectionLabel}>ATTENDANCE · LAST {history.length}</Text>
					{attendance.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={Colors.brand.base} />
						</View>
					) : history.length > 0 ? (
						<View style={styles.historySummary}>
							{(["present", "absent", "late", "excused"] as AttendanceMarkStatus[]).map(
								(status) => (
									<View key={status} style={styles.historyStat}>
										<View
											style={[
												styles.historyDot,
												{ backgroundColor: attendanceStatusColor(status) },
											]}
										/>
										<Text style={styles.historyStatLabel}>{attendanceStatusLabel(status)}</Text>
										<Text style={styles.historyStatValue}>{attendanceSummary[status]}</Text>
									</View>
								),
							)}
						</View>
					) : null}

					<View style={styles.historyCard}>
						{history.length === 0 ? (
							<EmptyState
								icon={CalendarCheck}
								title="No attendance recorded"
								description="This student's attendance history will appear here."
							/>
						) : (
							history
								.slice()
								.reverse()
								.map((item, index) => (
									<ListRow
										key={`${item.session.id}-${item.mark.id}`}
										icon={CalendarCheck}
										iconColor={attendanceStatusColor(item.mark.status)}
										iconBackground={attendanceStatusBackground(item.mark.status)}
										title={formatDate(item.session.sessionDate)}
										subtitle={`${item.session.sessionType} session`}
										badge={{
											label: attendanceStatusLabel(item.mark.status),
											status: attendanceStatusVariant(item.mark.status),
										}}
										last={index === history.length - 1}
									/>
								))
						)}
					</View>

					<Text style={styles.sectionLabel}>GRADES</Text>
					{report.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={Colors.brand.base} />
						</View>
					) : entries.length > 0 ? (
						<View style={styles.gradesCard}>
							{entries.map((entry, index) => (
								<ListRow
									key={`${entry.subjectId}-${entry.term}`}
									icon={GraduationCap}
									iconColor={Colors.brand.base}
									iconBackground={Colors.brand.tint}
									title={entry.subjectName}
									subtitle={`${entry.sectionName} · ${entry.term}`}
									value={`${Math.round(entry.percentage)}%`}
									badge={{ label: entry.grade, status: gradeVariant(entry.percentage) }}
									last={index === entries.length - 1}
								/>
							))}
							{report.data?.averageGradePoint != null ? (
								<View style={styles.gpaRow}>
									<View style={styles.gpaIcon}>
										<Trophy size={16} color={Colors.status.late.solid} />
									</View>
									<Text style={styles.gpaLabel}>Average grade point</Text>
									<Text style={styles.gpaValue}>{report.data.averageGradePoint.toFixed(2)}</Text>
								</View>
							) : null}
						</View>
					) : (
						<EmptyState
							icon={Users}
							title="No grades yet"
							description="Grades will appear once assessments are marked."
						/>
					)}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function gradeVariant(percentage: number): "present" | "brand" | "late" | "absent" {
	if (percentage >= 80) return "present";
	if (percentage >= 60) return "brand";
	if (percentage >= 40) return "late";
	return "absent";
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.canvas },
	safeArea: { flex: 1 },
	content: { paddingBottom: 48 },
	profileCard: {
		marginHorizontal: 16,
		marginTop: 8,
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
		backgroundColor: Colors.surface,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: Colors.border.base,
		padding: 16,
		...Elevation.raised,
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.sunken,
	},
	profileCopy: { flex: 1, gap: 2 },
	profileName: { ...Type.title, fontSize: Tokens.fontSize["3xl"] },
	profileMeta: Type.caption,
	sectionLabel: {
		color: Colors.text.muted,
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 0,
		marginHorizontal: 16,
		marginTop: 22,
		marginBottom: 10,
	},
	loading: { alignItems: "center", paddingVertical: 30 },
	historySummary: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	historyStat: {
		flex: 1,
		alignItems: "center",
		backgroundColor: Colors.surface,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.border.base,
		paddingVertical: 10,
		gap: 3,
	},
	historyDot: { width: 8, height: 8, borderRadius: 4 },
	historyStatLabel: {
		color: Colors.text.muted,
		fontSize: 10,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	historyStatValue: {
		color: Colors.text.primary,
		fontSize: Tokens.fontSize["2xl"],
		fontWeight: Tokens.fontWeight.bold,
	},
	historyCard: {
		marginHorizontal: 16,
		backgroundColor: Colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: Colors.border.base,
		overflow: "hidden",
	},
	gradesCard: {
		marginHorizontal: 16,
		backgroundColor: Colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: Colors.border.base,
		overflow: "hidden",
	},
	gpaRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.base,
	},
	gpaIcon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.status.late.bg,
	},
	gpaLabel: { flex: 1, color: Colors.text.secondary, fontSize: 13, fontWeight: "600" },
	gpaValue: { color: Colors.text.primary, fontSize: 16, fontWeight: "800" },
});
