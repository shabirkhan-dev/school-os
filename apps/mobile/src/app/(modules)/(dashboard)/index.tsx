import { router } from "expo-router";
import {
	AlertTriangle,
	ArrowRight,
	BookOpen,
	CalendarDays,
	CalendarRange,
	CheckCircle2,
	ClipboardCheck,
	Clock3,
	GraduationCap,
	IdCard,
	NotebookPen,
	RefreshCw,
	Rocket,
	Users,
	X,
} from "lucide-react-native";
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
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { OSHeader } from "@/components/ui/os-header";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColors, AppShadows } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import type { TeacherDashboardSection } from "@/modules/staff";
import { useMyTeacherDashboardQuery } from "@/modules/staff";
import { useAssessmentListQuery, useHomeworkListQuery } from "@/modules/teacher";

function localSessionDate(): string {
	return new Date().toLocaleDateString("en-CA");
}

export default function DashboardIndex() {
	const { tenantContext } = useAuth();
	const sessionDate = useMemo(localSessionDate, []);
	const isTeacher = tenantContext?.role === "teacher";
	const dashboard = useMyTeacherDashboardQuery(
		isTeacher ? (tenantContext?.tenantId ?? null) : null,
		sessionDate,
	);

	const data = dashboard.data;
	const stats = data?.stats;

	const homework = useHomeworkListQuery(tenantContext?.tenantId ?? null);
	const assessments = useAssessmentListQuery(tenantContext?.tenantId ?? null);
	const [onboardingDismissed, setOnboardingDismissed] = useState(false);
	const [reportsVisited, setReportsVisited] = useState(false);

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<OSHeader />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					refreshControl={
						<RefreshControl
							refreshing={dashboard.isRefetching}
							onRefresh={() => void dashboard.refetch()}
							tintColor={AppColors.primary.brand}
						/>
					}
				>
					<View style={styles.hero}>
						<View style={styles.heroCopy}>
							<Text style={styles.eyebrow}>
								{isTeacher
									? "TEACHER COMMAND CENTER"
									: `${formatRoleLabel(tenantContext?.role)} WORKSPACE`}
							</Text>
							<Text style={styles.title}>{isTeacher ? greeting() : "Welcome back."}</Text>
							<Text style={styles.subtitle}>
								{isTeacher
									? "Your classes, attendance, and priorities in one calm view."
									: "Your workspace, ready when you are."}
							</Text>
						</View>
						<View style={styles.datePill}>
							<CalendarDays size={14} color={AppColors.primary.brand} />
							<Text style={styles.dateText}>{formatDate(sessionDate)}</Text>
						</View>
					</View>

					{!tenantContext ? (
						<EmptyState
							icon={GraduationCap}
							title="Organization setup required"
							description="Your account is signed in, but it is not connected to a school organization yet."
						/>
					) : !isTeacher ? (
						<EmptyState
							icon={GraduationCap}
							title={`${formatRoleLabel(tenantContext.role)} workspace coming next`}
							description="This first mobile release is focused on the teacher workspace. Your account is signed in safely, and the matching portal will be added next."
						/>
					) : dashboard.isLoading ? (
						<View style={styles.loadingCard}>
							<ActivityIndicator color={AppColors.primary.brand} size="large" />
							<Text style={styles.loadingText}>Loading your teaching day…</Text>
						</View>
					) : dashboard.isError ? (
						<Card style={styles.errorCard}>
							<View style={styles.errorIcon}>
								<AlertTriangle size={20} color={AppColors.status.absent} />
							</View>
							<View style={styles.errorCopy}>
								<Text style={styles.errorTitle}>Dashboard unavailable</Text>
								<Text style={styles.errorText}>
									We could not load your teaching data. Try again.
								</Text>
							</View>
							<Pressable style={styles.retryButton} onPress={() => void dashboard.refetch()}>
								<RefreshCw size={16} color={AppColors.primary.brand} />
							</Pressable>
						</Card>
					) : data && stats ? (
						<>
							{isTeacher ? (
								<>
									<OnboardingCard
										data={data}
										homeworkCount={homework.data?.assignments.length ?? 0}
										assessmentCount={assessments.data?.assessments.length ?? 0}
										dismissed={onboardingDismissed}
										reportsVisited={reportsVisited}
										onDismiss={() => setOnboardingDismissed(true)}
										onReportsPress={() => setReportsVisited(true)}
									/>
									<QuickActions data={data} />
								</>
							) : null}
							<StatsGrid stats={stats} />
							<MorningDigest data={data} />
							{data.priorityActions.length > 0 ? (
								<PriorityActions actions={data.priorityActions} />
							) : null}
							<SectionHeader
								title="Your classes"
								subtitle={`${data.sections.length} assigned section${data.sections.length === 1 ? "" : "s"}`}
								actionLabel="View all"
								onAction={() => router.replace("/(modules)/(dashboard)/classes")}
							/>
							{data.sections.length > 0 ? (
								<View style={styles.sectionList}>
									{data.sections.slice(0, 4).map((item) => (
										<ClassRow
											key={`${item.section.id}-${item.section.subjectId ?? "homeroom"}`}
											item={item}
										/>
									))}
								</View>
							) : (
								<EmptyState
									icon={BookOpen}
									title="No classes assigned yet"
									description="Once your school assigns a class or subject, it will appear here."
								/>
							)}
							{data.alerts.length > 0 ? <Alerts alerts={data.alerts} /> : null}
						</>
					) : null}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function PriorityActions({
	actions,
}: {
	actions: NonNullable<ReturnType<typeof useMyTeacherDashboardQuery>["data"]>["priorityActions"];
}) {
	return (
		<Card
			title="Priority actions"
			description="The next small step for your teaching day."
			style={styles.digestCard}
		>
			{actions.slice(0, 3).map((action) => (
				<Pressable
					key={`${action.type}-${action.sectionId}`}
					style={({ pressed }) => [styles.priorityRow, pressed && styles.pressedRow]}
					onPress={() => router.replace(`/attendance/${action.sectionId}`)}
				>
					<View style={styles.priorityIcon}>
						<ClipboardCheck size={16} color={AppColors.status.late} />
					</View>
					<View style={styles.digestCopy}>
						<Text style={styles.digestLabel}>
							{action.type === "mark_attendance" ? "Mark attendance" : "Review absences"}
						</Text>
						<Text style={styles.digestValue}>
							{action.label} · {action.reason}
						</Text>
					</View>
				</Pressable>
			))}
		</Card>
	);
}

function StatsGrid({
	stats,
}: {
	stats: NonNullable<ReturnType<typeof useMyTeacherDashboardQuery>["data"]>["stats"];
}) {
	const items = [
		{ label: "Students", value: stats.totalStudents, hint: "Across your classes", icon: Users },
		{
			label: "Classes",
			value: stats.totalClasses,
			hint: `${stats.homeroomCount} homeroom · ${stats.subjectCount} subject`,
			icon: BookOpen,
		},
		{
			label: "Present today",
			value: stats.todayPresent,
			hint:
				stats.todayAttendanceRate != null
					? `${stats.todayAttendanceRate}% attendance`
					: "Mark attendance to track",
			icon: CheckCircle2,
		},
		{
			label: "Needs marking",
			value: stats.pendingAttendanceCount,
			hint: stats.pendingAttendanceCount === 0 ? "All caught up" : "Classes pending today",
			icon: ClipboardCheck,
			alert: stats.pendingAttendanceCount > 0,
		},
	];

	return (
		<View style={styles.statsGrid}>
			{items.map((item) => {
				const Icon = item.icon;
				return (
					<View key={item.label} style={[styles.statCard, item.alert && styles.statCardAlert]}>
						<View style={styles.statTopRow}>
							<Text style={styles.statLabel}>{item.label}</Text>
							<Icon size={16} color={item.alert ? AppColors.status.late : AppColors.text.muted} />
						</View>
						<Text style={styles.statValue}>{item.value}</Text>
						<Text style={styles.statHint}>{item.hint}</Text>
					</View>
				);
			})}
		</View>
	);
}

function MorningDigest({
	data,
}: {
	data: NonNullable<ReturnType<typeof useMyTeacherDashboardQuery>["data"]>;
}) {
	const upcoming = data.morningDigest.upcomingPeriod;
	const pending = data.morningDigest.yesterdayUnmarkedSections.length;
	return (
		<Card
			title="Today at a glance"
			description="Small actions that keep your school day moving."
			style={styles.digestCard}
		>
			<View style={styles.digestRow}>
				<View style={styles.digestIcon}>
					<Clock3 size={17} color={AppColors.primary.brand} />
				</View>
				<View style={styles.digestCopy}>
					<Text style={styles.digestLabel}>Next class</Text>
					<Text style={styles.digestValue}>
						{upcoming ? `${upcoming.periodName} · ${upcoming.sectionName}` : "No upcoming class"}
					</Text>
				</View>
				{upcoming ? (
					<StatusBadge label={upcoming.subjectName ?? "Class"} status="brand" size="sm" />
				) : null}
			</View>
			<View style={styles.digestRow}>
				<View style={styles.digestIcon}>
					<ClipboardCheck
						size={17}
						color={pending > 0 ? AppColors.status.late : AppColors.status.present}
					/>
				</View>
				<View style={styles.digestCopy}>
					<Text style={styles.digestLabel}>Attendance follow-up</Text>
					<Text style={styles.digestValue}>
						{pending > 0
							? `${pending} section${pending === 1 ? "" : "s"} need review`
							: "Yesterday is fully marked"}
					</Text>
				</View>
			</View>
		</Card>
	);
}

function ClassRow({ item }: { item: TeacherDashboardSection }) {
	const summary = item.todayAttendance.summary;
	const isComplete = item.todayAttendance.isComplete;
	return (
		<Card style={styles.classCard} onPress={() => router.push(`/class/${item.section.id}`)}>
			<View style={styles.classRow}>
				<View style={styles.classIcon}>
					<BookOpen size={18} color={AppColors.primary.brand} />
				</View>
				<View style={styles.classCopy}>
					<Text style={styles.className}>{item.section.name}</Text>
					<Text style={styles.classMeta}>
						{item.section.subjectName ?? "Homeroom"} · {item.studentCount} students
					</Text>
				</View>
				<ArrowRight size={17} color={AppColors.text.muted} />
			</View>
			<View style={styles.classFooter}>
				<StatusBadge
					label={isComplete ? "Marked" : "Needs marking"}
					status={isComplete ? "present" : "pending"}
					size="sm"
				/>
				<Text style={styles.attendanceText}>
					{summary ? `${summary.present} present · ${summary.absent} absent` : "No attendance yet"}
				</Text>
			</View>
		</Card>
	);
}

function Alerts({
	alerts,
}: {
	alerts: NonNullable<ReturnType<typeof useMyTeacherDashboardQuery>["data"]>["alerts"];
}) {
	return (
		<>
			<SectionHeader title="Needs your attention" subtitle="Student wellbeing signals" />
			<View style={styles.alertList}>
				{alerts.slice(0, 3).map((alert) => (
					<View key={`${alert.studentId}-${alert.sectionId}`} style={styles.alertRow}>
						<View style={styles.alertIcon}>
							<AlertTriangle size={16} color={AppColors.status.late} />
						</View>
						<View style={styles.alertCopy}>
							<Text style={styles.alertName}>{alert.studentName}</Text>
							<Text style={styles.alertText}>
								{alert.consecutiveDays} consecutive days absent · {alert.sectionLabel}
							</Text>
						</View>
					</View>
				))}
			</View>
		</>
	);
}

function OnboardingCard({
	data,
	homeworkCount,
	assessmentCount,
	dismissed,
	reportsVisited,
	onDismiss,
	onReportsPress,
}: {
	data: NonNullable<ReturnType<typeof useMyTeacherDashboardQuery>["data"]>;
	homeworkCount: number;
	assessmentCount: number;
	dismissed: boolean;
	reportsVisited: boolean;
	onDismiss: () => void;
	onReportsPress: () => void;
}) {
	const stats = data.stats;
	const firstPendingSection = firstPendingSectionId(data);

	const steps: Array<{
		label: string;
		description: string;
		done: boolean;
		onPress: () => void;
	}> = [
		{
			label: "Take attendance",
			description:
				stats.pendingAttendanceCount > 0
					? `${stats.pendingAttendanceCount} class${stats.pendingAttendanceCount === 1 ? "" : "es"} still to mark`
					: "Every class is marked",
			done: data.sections.length > 0 && stats.pendingAttendanceCount === 0,
			onPress: () =>
				router.replace(
					firstPendingSection
						? `/attendance/${firstPendingSection}`
						: "/(modules)/(dashboard)/classes",
				),
		},
		{
			label: "Assign your first homework",
			description:
				homeworkCount > 0
					? `${homeworkCount} assignment${homeworkCount === 1 ? "" : "s"} published`
					: "Publish homework from any class",
			done: homeworkCount > 0,
			onPress: () => router.replace("/(modules)/(dashboard)/classes"),
		},
		{
			label: "Schedule your first test",
			description:
				assessmentCount > 0
					? `${assessmentCount} test${assessmentCount === 1 ? "" : "s"} scheduled`
					: "Quiz, test, or exam — your choice",
			done: assessmentCount > 0,
			onPress: () => router.replace("/(modules)/(dashboard)/work"),
		},
		{
			label: "Check your reports",
			description: "Attendance, grades, and homework completion",
			done: reportsVisited,
			onPress: () => {
				onReportsPress();
				router.replace("/(modules)/(dashboard)/reports");
			},
		},
	];

	const doneCount = steps.filter((step) => step.done).length;
	const allDone = doneCount === steps.length;
	if (dismissed || allDone) return null;

	return (
		<View style={styles.onboardingCard}>
			<View style={styles.onboardingHeader}>
				<View style={styles.onboardingIcon}>
					<Rocket size={18} color={AppColors.primary.brand} />
				</View>
				<View style={styles.onboardingCopy}>
					<Text style={styles.onboardingTitle}>Set up your day</Text>
					<Text style={styles.onboardingMeta}>
						{doneCount} of {steps.length} done
					</Text>
				</View>
				<Pressable onPress={onDismiss} style={styles.onboardingDismiss} hitSlop={8}>
					<X size={16} color={AppColors.text.muted} />
				</Pressable>
			</View>
			<View style={styles.onboardingProgress}>
				<View
					style={[
						styles.onboardingProgressFill,
						{ width: `${Math.round((doneCount / steps.length) * 100)}%` },
					]}
				/>
			</View>
			<View style={styles.onboardingSteps}>
				{steps.map((step) => (
					<Pressable
						key={step.label}
						style={({ pressed }) => [styles.onboardingStep, pressed && styles.pressedRow]}
						onPress={step.onPress}
					>
						{step.done ? (
							<CheckCircle2 size={18} color={AppColors.status.present} strokeWidth={2.2} />
						) : (
							<View style={styles.onboardingStepDot} />
						)}
						<View style={styles.onboardingStepCopy}>
							<Text style={[styles.onboardingStepLabel, step.done && styles.onboardingStepDone]}>
								{step.label}
							</Text>
							<Text style={styles.onboardingStepDesc}>{step.description}</Text>
						</View>
						<ArrowRight size={15} color={AppColors.text.muted} />
					</Pressable>
				))}
			</View>
		</View>
	);
}

function QuickActions({
	data,
}: {
	data: NonNullable<ReturnType<typeof useMyTeacherDashboardQuery>["data"]>;
}) {
	const firstPendingSection = firstPendingSectionId(data);

	const actions = [
		{
			label: "Take attendance",
			icon: ClipboardCheck,
			color: AppColors.status.present,
			background: AppColors.status.presentBg,
			onPress: () =>
				router.replace(
					firstPendingSection
						? `/attendance/${firstPendingSection}`
						: "/(modules)/(dashboard)/classes",
				),
		},
		{
			label: "Test planner",
			icon: CalendarRange,
			color: AppColors.accent.purple,
			background: "#F3E8FF",
			onPress: () => router.push("/planner"),
		},
		{
			label: "Assign homework",
			icon: NotebookPen,
			color: AppColors.primary.brand,
			background: AppColors.primary.subtle,
			onPress: () => router.replace("/(modules)/(dashboard)/classes"),
		},
		{
			label: "Staff ID",
			icon: IdCard,
			color: AppColors.status.late,
			background: AppColors.status.lateBg,
			onPress: () => router.push("/staff-id"),
		},
	];

	return (
		<View style={styles.quickActions}>
			{actions.map((action) => {
				const Icon = action.icon;
				return (
					<Pressable
						key={action.label}
						style={({ pressed }) => [styles.quickAction, pressed && styles.pressedTile]}
						onPress={action.onPress}
					>
						<View style={[styles.quickActionIcon, { backgroundColor: action.background }]}>
							<Icon size={22} color={action.color} strokeWidth={2} />
						</View>
						<Text style={styles.quickActionLabel} numberOfLines={1}>
							{action.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

function firstPendingSectionId(
	data: NonNullable<ReturnType<typeof useMyTeacherDashboardQuery>["data"]>,
): string | undefined {
	return (
		data.priorityActions.find((action) => action.type === "mark_attendance")?.sectionId ??
		data.sections.find((item) => !item.todayAttendance.isComplete)?.section.id
	);
}

function greeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning.";
	if (hour < 17) return "Good afternoon.";
	return "Good evening.";
}

function formatDate(value: string): string {
	return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	scrollContent: { paddingBottom: 44 },
	hero: {
		paddingHorizontal: 16,
		paddingTop: 20,
		paddingBottom: 8,
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: 12,
	},
	heroCopy: { flex: 1, gap: 4 },
	eyebrow: { color: AppColors.primary.brand, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
	title: { color: AppColors.text.primary, fontSize: 30, fontWeight: "800", letterSpacing: -0.8 },
	subtitle: { color: AppColors.text.secondary, fontSize: 13, lineHeight: 19 },
	datePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		backgroundColor: AppColors.primary.subtle,
		borderRadius: 999,
		paddingHorizontal: 9,
		paddingVertical: 7,
	},
	dateText: { color: AppColors.primary.brand, fontSize: 12, fontWeight: "700" },
	loadingCard: {
		margin: 16,
		minHeight: 180,
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		...AppShadows.sm,
	},
	loadingText: { color: AppColors.text.secondary, fontSize: 14 },
	errorCard: { marginHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 12 },
	errorIcon: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.status.absentBg,
	},
	errorCopy: { flex: 1, gap: 2 },
	errorTitle: { color: AppColors.text.primary, fontWeight: "700", fontSize: 15 },
	errorText: { color: AppColors.text.secondary, fontSize: 13 },
	retryButton: {
		width: 38,
		height: 38,
		borderRadius: 19,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	onboardingCard: {
		marginHorizontal: 16,
		marginTop: 14,
		backgroundColor: AppColors.surface,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		padding: 16,
		...AppShadows.sm,
	},
	onboardingHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	onboardingIcon: {
		width: 36,
		height: 36,
		borderRadius: 11,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	onboardingCopy: { flex: 1, gap: 1 },
	onboardingTitle: { color: AppColors.text.primary, fontSize: 15, fontWeight: "800" },
	onboardingMeta: { color: AppColors.text.muted, fontSize: 12 },
	onboardingDismiss: {
		width: 28,
		height: 28,
		borderRadius: 9,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.card.subtle,
	},
	onboardingProgress: {
		height: 5,
		borderRadius: 3,
		backgroundColor: AppColors.card.subtle,
		marginTop: 12,
		overflow: "hidden",
	},
	onboardingProgressFill: {
		height: "100%",
		borderRadius: 3,
		backgroundColor: AppColors.primary.brand,
	},
	onboardingSteps: { marginTop: 6 },
	onboardingStep: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 9,
	},
	onboardingStepDot: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 2,
		borderColor: AppColors.card.border,
	},
	onboardingStepCopy: { flex: 1, gap: 1 },
	onboardingStepLabel: { color: AppColors.text.primary, fontSize: 14, fontWeight: "600" },
	onboardingStepDone: { color: AppColors.text.muted, textDecorationLine: "line-through" },
	onboardingStepDesc: { color: AppColors.text.secondary, fontSize: 12 },
	quickActions: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		paddingHorizontal: 16,
		marginTop: 12,
	},
	quickAction: {
		width: "48%",
		flexGrow: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		backgroundColor: AppColors.surface,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		borderRadius: 15,
		paddingHorizontal: 12,
		paddingVertical: 12,
		...AppShadows.sm,
	},
	quickActionIcon: {
		width: 40,
		height: 40,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	quickActionLabel: {
		color: AppColors.text.primary,
		fontSize: 13,
		fontWeight: "700",
		flex: 1,
	},
	pressedTile: { opacity: 0.85, transform: [{ scale: 0.985 }] },
	statsGrid: {
		paddingHorizontal: 16,
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 12,
	},
	statCard: {
		width: "48%",
		flexGrow: 1,
		minHeight: 112,
		padding: 14,
		borderRadius: 15,
		backgroundColor: AppColors.surface,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		...AppShadows.sm,
	},
	statCardAlert: { borderColor: "#FCD34D", backgroundColor: "#FFFBEB" },
	statTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	statLabel: {
		color: AppColors.text.muted,
		fontSize: 11,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.4,
	},
	statValue: { color: AppColors.text.primary, fontSize: 28, fontWeight: "800", marginTop: 8 },
	statHint: { color: AppColors.text.secondary, fontSize: 11, lineHeight: 15, marginTop: 2 },
	digestCard: { marginHorizontal: 16, marginTop: 18 },
	digestRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 10,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	digestIcon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	digestCopy: { flex: 1, gap: 2 },
	digestLabel: {
		color: AppColors.text.muted,
		fontSize: 11,
		fontWeight: "700",
		textTransform: "uppercase",
	},
	digestValue: { color: AppColors.text.primary, fontSize: 13, fontWeight: "600" },
	sectionList: { paddingHorizontal: 16, gap: 10 },
	classCard: { padding: 14 },
	classRow: { flexDirection: "row", alignItems: "center", gap: 10 },
	classIcon: {
		width: 38,
		height: 38,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	classCopy: { flex: 1, gap: 3 },
	className: { color: AppColors.text.primary, fontSize: 15, fontWeight: "700" },
	classMeta: { color: AppColors.text.secondary, fontSize: 12 },
	classFooter: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingTop: 12,
		marginTop: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	attendanceText: { color: AppColors.text.secondary, fontSize: 12 },
	alertList: {
		marginHorizontal: 16,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
	},
	alertRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		padding: 14,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: AppColors.card.border,
	},
	alertIcon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFBEB",
	},
	alertCopy: { flex: 1, gap: 2 },
	alertName: { color: AppColors.text.primary, fontSize: 14, fontWeight: "700" },
	alertText: { color: AppColors.text.secondary, fontSize: 12 },
	priorityRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 10,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	priorityIcon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFBEB",
	},
	pressedRow: { opacity: 0.72 },
});

function formatRoleLabel(role?: string): string {
	if (!role) return "School OS";
	return role
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
