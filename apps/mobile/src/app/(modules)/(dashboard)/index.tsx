import { router } from "expo-router";
import {
	AlertTriangle,
	ArrowRight,
	BookOpen,
	CalendarRange,
	ClipboardCheck,
	GraduationCap,
	IdCard,
	NotebookPen,
	RefreshCw,
	Users,
} from "lucide-react-native";
import { useMemo } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { IconTile, type TileTone } from "@/components/ui/icon-tile";
import { MetaRow } from "@/components/ui/meta-row";
import { OSHeader } from "@/components/ui/os-header";
import { PressableScale } from "@/components/ui/pressable-scale";
import { SectionHeader } from "@/components/ui/section-header";
import { SkeletonDashboard } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { TAB_BAR_CLEARANCE } from "@/components/ui/tab-bar";
import { Colors, Shadows, Tokens, Type } from "@/constants/design-system";
import { formatRoleLabel } from "@/lib/format-role";
import { useAuth } from "@/modules/auth";
import type {
	TeacherDashboard,
	TeacherDashboardAlert,
	TeacherDashboardSection,
} from "@/modules/staff";
import { useMyTeacherDashboardQuery } from "@/modules/staff";

export default function DashboardIndex() {
	const { tenantContext } = useAuth();
	const date = useMemo(todayIso, []);
	const isTeacher = tenantContext?.role === "teacher";

	const dashboard = useMyTeacherDashboardQuery(
		isTeacher ? (tenantContext?.tenantId ?? null) : null,
		date,
	);

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
						<Text style={styles.greeting}>{isTeacher ? greeting() : "Welcome back."}</Text>
						<Text style={styles.heroDate}>{formatLongDate(date)}</Text>
					</View>

					{!tenantContext ? (
						<EmptyState
							icon={GraduationCap}
							title="Organization setup required"
							description="You're signed in, but your account isn't connected to a school yet."
						/>
					) : !isTeacher ? (
						<EmptyState
							icon={GraduationCap}
							title={`${formatRoleLabel(tenantContext.role)} workspace coming next`}
							description="This release focuses on the teacher workspace. Your portal is next in line."
						/>
					) : dashboard.isLoading ? (
						<SkeletonDashboard />
					) : dashboard.isError ? (
						<ErrorCard onRetry={() => void dashboard.refetch()} />
					) : dashboard.data ? (
						<DashboardBody data={dashboard.data} />
					) : null}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function DashboardBody({ data }: { data: TeacherDashboard }) {
	const { stats, sections, alerts } = data;
	const pending = stats.pendingAttendanceCount;

	return (
		<>
			<FocusCard pending={pending} nextSectionId={firstPendingSectionId(data)} />
			<StatStrip stats={stats} />
			<QuickActions nextSectionId={firstPendingSectionId(data)} />

			<SectionHeader
				title="Your classes"
				subtitle={plural(sections.length, "assigned section")}
				actionLabel={sections.length > 4 ? "View all" : undefined}
				onAction={
					sections.length > 4 ? () => router.replace("/(modules)/(dashboard)/classes") : undefined
				}
			/>

			{sections.length > 0 ? (
				<View style={styles.stack}>
					{sections.slice(0, 4).map((item) => (
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
					description="Once your school assigns a class or subject, it appears here."
				/>
			)}

			{alerts.length > 0 ? <AlertList alerts={alerts} /> : null}
		</>
	);
}

/**
 * The single most important thing to do right now, as a full-width charcoal
 * card. Only one of these renders at a time — competing hero cards would defeat
 * the purpose.
 */
function FocusCard({ pending, nextSectionId }: { pending: number; nextSectionId?: string }) {
	const allClear = pending === 0;

	return (
		<View style={[styles.focusCard, allClear && styles.focusCardClear]}>
			<View style={styles.focusCopy}>
				<Text style={[styles.focusTitle, allClear && styles.focusTitleClear]}>
					{allClear ? "All caught up." : plural(pending, "class", "classes")}
				</Text>
				<Text style={[styles.focusBody, allClear && styles.focusBodyClear]}>
					{allClear
						? "Every class is marked for today. Nothing needs your attention."
						: "Still waiting on attendance for today."}
				</Text>

				{!allClear ? (
					<PressableScale
						style={styles.focusCta}
						scaleTo={0.96}
						onPress={() =>
							router.replace(
								nextSectionId ? `/attendance/${nextSectionId}` : "/(modules)/(dashboard)/classes",
							)
						}
						accessibilityRole="button"
						accessibilityLabel="Mark attendance now"
					>
						<Text style={styles.focusCtaLabel}>Mark now</Text>
						<ArrowRight size={15} color={Colors.text.primary} strokeWidth={2.4} />
					</PressableScale>
				) : null}
			</View>

			<IconTile
				icon={allClear ? ClipboardCheck : AlertTriangle}
				tone={allClear ? "green" : "amber"}
				size="lg"
			/>
		</View>
	);
}

/** Three headline figures. Kept to three so each stays legible on a small screen. */
function StatStrip({ stats }: { stats: TeacherDashboard["stats"] }) {
	const items = [
		{
			label: "Students",
			value: stats.totalStudents,
			hint: plural(stats.totalClasses, "class", "classes"),
		},
		{
			label: "Present",
			value: stats.todayPresent,
			hint:
				stats.todayAttendanceRate != null ? `${stats.todayAttendanceRate}% today` : "Not marked",
		},
		{
			label: "To mark",
			value: stats.pendingAttendanceCount,
			hint: stats.pendingAttendanceCount === 0 ? "Complete" : "Remaining",
			alert: stats.pendingAttendanceCount > 0,
		},
	];

	return (
		<View style={styles.statStrip}>
			{items.map((item) => (
				<View key={item.label} style={styles.statTile}>
					<Text style={styles.statLabel}>{item.label}</Text>
					<Text style={[styles.statValue, item.alert && styles.statValueAlert]}>{item.value}</Text>
					<Text style={styles.statHint} numberOfLines={1}>
						{item.hint}
					</Text>
				</View>
			))}
		</View>
	);
}

function QuickActions({ nextSectionId }: { nextSectionId?: string }) {
	const actions: Array<{
		label: string;
		icon: typeof ClipboardCheck;
		tone: TileTone;
		go: () => void;
	}> = [
		{
			label: "Attendance",
			icon: ClipboardCheck,
			tone: "green",
			go: () =>
				router.replace(
					nextSectionId ? `/attendance/${nextSectionId}` : "/(modules)/(dashboard)/classes",
				),
		},
		{
			label: "Planner",
			icon: CalendarRange,
			tone: "purple",
			go: () => router.push("/planner"),
		},
		{
			label: "Homework",
			icon: NotebookPen,
			tone: "blue",
			go: () => router.replace("/(modules)/(dashboard)/classes"),
		},
		{ label: "Staff ID", icon: IdCard, tone: "amber", go: () => router.push("/staff-id") },
	];

	return (
		<View style={styles.quickRow}>
			{actions.map((action) => (
				<PressableScale
					key={action.label}
					style={styles.quickTile}
					scaleTo={0.94}
					onPress={action.go}
					accessibilityRole="button"
					accessibilityLabel={action.label}
				>
					<IconTile icon={action.icon} tone={action.tone} size="md" />
					<Text style={styles.quickLabel} numberOfLines={1}>
						{action.label}
					</Text>
				</PressableScale>
			))}
		</View>
	);
}

/**
 * Class row. The left accent bar encodes attendance state at a glance, so the
 * row can be scanned in a column without reading the badge on each one.
 */
function ClassRow({ item }: { item: TeacherDashboardSection }) {
	const { summary, isComplete } = item.todayAttendance;

	return (
		<PressableScale
			style={styles.row}
			scaleTo={0.985}
			onPress={() => router.push(`/class/${item.section.id}`)}
			accessibilityRole="button"
			accessibilityLabel={`${item.section.name}, ${isComplete ? "marked" : "needs marking"}`}
		>
			<View
				style={[
					styles.accentBar,
					{
						backgroundColor: isComplete ? Colors.status.present.solid : Colors.status.late.solid,
					},
				]}
			/>

			<IconTile icon={BookOpen} tone={isComplete ? "green" : "amber"} size="md" />

			<View style={styles.rowCopy}>
				<Text style={styles.rowTitle} numberOfLines={1}>
					{item.section.name}
				</Text>
				<MetaRow
					items={[
						{ value: item.section.subjectName ?? "Homeroom" },
						{ icon: Users, value: `${item.studentCount}` },
						...(summary ? [{ value: `${summary.present} present`, tone: "strong" as const }] : []),
					]}
				/>
			</View>

			<StatusBadge
				label={isComplete ? "Marked" : "Pending"}
				status={isComplete ? "present" : "pending"}
				size="sm"
			/>
		</PressableScale>
	);
}

function AlertList({ alerts }: { alerts: TeacherDashboardAlert[] }) {
	return (
		<>
			<SectionHeader title="Needs attention" subtitle="Consecutive absences" />
			<View style={styles.stack}>
				{alerts.slice(0, 3).map((alert) => (
					<PressableScale
						key={`${alert.studentId}-${alert.sectionId}`}
						style={styles.row}
						scaleTo={0.985}
						onPress={() => router.push(`/student/${alert.studentId}`)}
						accessibilityRole="button"
						accessibilityLabel={`${alert.studentName}, ${alert.consecutiveDays} days absent`}
					>
						<View style={[styles.accentBar, { backgroundColor: Colors.status.absent.solid }]} />
						<IconTile icon={AlertTriangle} tone="rose" size="md" />
						<View style={styles.rowCopy}>
							<Text style={styles.rowTitle} numberOfLines={1}>
								{alert.studentName}
							</Text>
							<MetaRow
								items={[
									{ value: `${alert.consecutiveDays} days absent`, tone: "warn" },
									{ value: alert.sectionLabel },
								]}
							/>
						</View>
					</PressableScale>
				))}
			</View>
		</>
	);
}

function ErrorCard({ onRetry }: { onRetry: () => void }) {
	return (
		<View style={styles.errorCard}>
			<IconTile icon={AlertTriangle} tone="rose" size="md" />
			<View style={styles.rowCopy}>
				<Text style={styles.rowTitle}>Dashboard unavailable</Text>
				<Text style={styles.errorBody}>We couldn't load your teaching data.</Text>
			</View>
			<PressableScale
				style={styles.retryButton}
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

/* ---------------------------------------------------------------- helpers */

function todayIso(): string {
	return new Date().toLocaleDateString("en-CA");
}

function greeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning.";
	if (hour < 18) return "Good afternoon.";
	return "Good evening.";
}

function formatLongDate(iso: string): string {
	return new Date(`${iso}T12:00:00`).toLocaleDateString(undefined, {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
}

function plural(count: number, noun: string, pluralForm?: string): string {
	const word = count === 1 ? noun : (pluralForm ?? `${noun}s`);
	return `${count} ${word}`;
}

function firstPendingSectionId(data: TeacherDashboard): string | undefined {
	return (
		data.priorityActions.find((action) => action.type === "mark_attendance")?.sectionId ??
		data.sections.find((item) => !item.todayAttendance.isComplete)?.section.id
	);
}

/* ----------------------------------------------------------------- styles */

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
	greeting: Type.display,
	heroDate: {
		...Type.meta,
		color: Colors.text.tertiary,
		marginTop: Tokens.space["1"],
	},

	focusCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["4"],
		marginHorizontal: GUTTER,
		padding: Tokens.space["5"],
		borderRadius: Tokens.radius["2xl"],
		backgroundColor: Colors.ink.base,
		...Shadows.md,
	},
	focusCardClear: {
		backgroundColor: Colors.surface,
	},
	focusCopy: { flex: 1 },
	focusTitle: {
		...Type.heading,
		color: Colors.ink.foreground,
	},
	focusTitleClear: { color: Colors.text.primary },
	focusBody: {
		...Type.caption,
		color: "rgba(255,255,255,0.62)",
		marginTop: Tokens.space["1"],
	},
	focusBodyClear: { color: Colors.text.tertiary },
	focusCta: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["1.5"],
		alignSelf: "flex-start",
		marginTop: Tokens.space["4"],
		paddingVertical: Tokens.space["2.5"],
		paddingHorizontal: Tokens.space["4"],
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.surface,
	},
	focusCtaLabel: {
		fontSize: Tokens.fontSize.md,
		fontWeight: Tokens.fontWeight.bold,
		color: Colors.text.primary,
		letterSpacing: Tokens.tracking.snug,
	},

	statStrip: {
		flexDirection: "row",
		gap: Tokens.space["2.5"],
		paddingHorizontal: GUTTER,
		marginTop: Tokens.space["3"],
	},
	statTile: {
		flex: 1,
		paddingVertical: Tokens.space["4"],
		paddingHorizontal: Tokens.space["3.5"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		...Shadows.xs,
	},
	statLabel: {
		...Type.overline,
		fontSize: Tokens.fontSize["2xs"],
	},
	statValue: {
		...Type.metricSm,
		marginTop: Tokens.space["2"],
	},
	statValueAlert: { color: Colors.status.late.fg },
	statHint: {
		fontSize: Tokens.fontSize.xs,
		fontWeight: Tokens.fontWeight.medium,
		color: Colors.text.muted,
		marginTop: Tokens.space["0.5"],
	},

	quickRow: {
		flexDirection: "row",
		gap: Tokens.space["2.5"],
		paddingHorizontal: GUTTER,
		marginTop: Tokens.space["3"],
	},
	quickTile: {
		flex: 1,
		alignItems: "center",
		gap: Tokens.space["2"],
		paddingVertical: Tokens.space["4"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		...Shadows.xs,
	},
	quickLabel: {
		fontSize: Tokens.fontSize.xs,
		fontWeight: Tokens.fontWeight.semibold,
		color: Colors.text.secondary,
		letterSpacing: Tokens.tracking.snug,
	},

	stack: { paddingHorizontal: GUTTER, gap: Tokens.space["2.5"] },
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		paddingVertical: Tokens.space["3.5"],
		paddingRight: Tokens.space["4"],
		paddingLeft: Tokens.space["4"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		overflow: "hidden",
		...Shadows.xs,
	},
	accentBar: {
		position: "absolute",
		left: 0,
		top: Tokens.space["3"],
		bottom: Tokens.space["3"],
		width: 3,
		borderTopRightRadius: Tokens.radius.full,
		borderBottomRightRadius: Tokens.radius.full,
	},
	rowCopy: { flex: 1, gap: Tokens.space["1"] },
	rowTitle: {
		...Type.subheading,
		fontSize: Tokens.fontSize.lg,
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
	errorBody: {
		...Type.caption,
	},
	retryButton: {
		width: 38,
		height: 38,
		borderRadius: Tokens.radius.full,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.sunken,
	},
});
