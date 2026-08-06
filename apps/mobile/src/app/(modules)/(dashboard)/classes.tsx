import { router } from "expo-router";
import { AlertTriangle, BookOpen, GraduationCap, RefreshCw } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { OSHeader } from "@/components/ui/os-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColors } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import { useMyTeacherDashboardQuery } from "@/modules/staff";

function localSessionDate(): string {
	return new Date().toLocaleDateString("en-CA");
}

export default function ClassesScreen() {
	const { tenantContext } = useAuth();
	const date = useMemo(localSessionDate, []);
	const isTeacher = tenantContext?.role === "teacher";
	const dashboard = useMyTeacherDashboardQuery(
		isTeacher ? (tenantContext?.tenantId ?? null) : null,
		date,
	);

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<OSHeader />
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
					<Text style={styles.eyebrow}>{isTeacher ? "TEACHING SPACE" : "SCHOOL SPACE"}</Text>
					<Text style={styles.title}>{isTeacher ? "Your classes" : "Classes"}</Text>
					<Text style={styles.subtitle}>
						Every section you teach, with today’s attendance at a glance.
					</Text>
					{!tenantContext || !isTeacher ? (
						<EmptyState
							icon={GraduationCap}
							title={
								!tenantContext ? "Organization setup required" : "Teacher workspace coming next"
							}
							description={
								!tenantContext
									? "Connect your account to a school organization to see classes."
									: "The first mobile release is focused on the teacher workspace."
							}
						/>
					) : dashboard.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={AppColors.primary.brand} />
						</View>
					) : dashboard.isError ? (
						<View style={styles.errorCard}>
							<View style={styles.errorIcon}>
								<AlertTriangle size={18} color={AppColors.status.absent} />
							</View>
							<View style={styles.copy}>
								<Text style={styles.name}>Classes unavailable</Text>
								<Text style={styles.meta}>We could not load your class list. Try again.</Text>
							</View>
							<Pressable onPress={() => void dashboard.refetch()} style={styles.retryButton}>
								<RefreshCw size={16} color={AppColors.primary.brand} />
							</Pressable>
						</View>
					) : dashboard.data?.sections.length ? (
						<View style={styles.list}>
							{dashboard.data.sections.map((item) => {
								const summary = item.todayAttendance.summary;
								return (
									<Card
										key={`${item.section.id}-${item.section.subjectId ?? "homeroom"}`}
										style={styles.card}
										onPress={() => router.push(`/class/${item.section.id}`)}
									>
										<View style={styles.cardHeader}>
											<View style={styles.icon}>
												<BookOpen size={19} color={AppColors.primary.brand} />
											</View>
											<View style={styles.copy}>
												<Text style={styles.name}>{item.section.name}</Text>
												<Text style={styles.meta}>
													{item.section.subjectName ?? "Homeroom"} · {item.studentCount} students
												</Text>
											</View>
											<StatusBadge
												label={item.todayAttendance.isComplete ? "Marked" : "Pending"}
												status={item.todayAttendance.isComplete ? "present" : "pending"}
												size="sm"
											/>
										</View>
										<Text style={styles.attendance}>
											{summary
												? `${summary.present} present · ${summary.absent} absent · ${summary.late} late`
												: "Attendance has not been recorded yet."}
										</Text>
									</Card>
								);
							})}
						</View>
					) : (
						<EmptyState
							icon={GraduationCap}
							title="No classes yet"
							description="Your assigned sections will appear here when your school connects them to your account."
						/>
					)}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	content: { padding: 20, paddingBottom: 48 },
	eyebrow: { color: AppColors.primary.brand, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
	title: { color: AppColors.text.primary, fontSize: 30, fontWeight: "800", marginTop: 4 },
	subtitle: { color: AppColors.text.secondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
	loading: { minHeight: 180, alignItems: "center", justifyContent: "center" },
	list: { gap: 10, marginTop: 22 },
	card: { padding: 14 },
	cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
	icon: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	copy: { flex: 1, gap: 3 },
	name: { color: AppColors.text.primary, fontSize: 15, fontWeight: "700" },
	meta: { color: AppColors.text.secondary, fontSize: 12 },
	errorCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginTop: 22,
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
	retryButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	attendance: {
		color: AppColors.text.secondary,
		fontSize: 12,
		marginTop: 13,
		paddingTop: 11,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
});
