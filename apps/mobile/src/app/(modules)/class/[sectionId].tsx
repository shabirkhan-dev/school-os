import { router, useLocalSearchParams } from "expo-router";
import {
	BookOpen,
	CalendarPlus,
	ClipboardCheck,
	FileText,
	GraduationCap,
	NotebookPen,
	Search,
	Users,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColors, AppShadows } from "@/constants/design-system";
import { resolveMediaUrl } from "@/lib/media-url";
import { useAuth } from "@/modules/auth";
import type { Assessment } from "@/modules/teacher";
import {
	useAssessmentListQuery,
	useHomeworkListQuery,
	useSectionStudentsQuery,
	useTeacherProfileQuery,
} from "@/modules/teacher";
import { AssignHomeworkSheet } from "@/modules/teacher/components/assign-homework-sheet";
import { ListRow } from "@/modules/teacher/components/list-row";
import { ScheduleAssessmentSheet } from "@/modules/teacher/components/schedule-assessment-sheet";
import { ScreenHeader } from "@/modules/teacher/components/screen-header";
import { Segmented } from "@/modules/teacher/components/segmented";
import {
	assessmentStatusVariant,
	formatDate,
	formatFullDate,
	homeworkStatusVariant,
} from "@/modules/teacher/lib/format";

type Segment = "students" | "homework" | "assessments";

export default function ClassDetailScreen() {
	const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;

	const profile = useTeacherProfileQuery(tenantId);
	const students = useSectionStudentsQuery(tenantId, sectionId);
	const [segment, setSegment] = useState<Segment>("students");
	const [search, setSearch] = useState("");
	const [homeworkSheet, setHomeworkSheet] = useState(false);
	const [assessmentSheet, setAssessmentSheet] = useState(false);

	const section = profile.data?.accessibleSections.find((item) => item.id === sectionId);
	const subjectAssignment = profile.data?.subjectAssignments.find(
		(assignment) => assignment.sectionId === sectionId,
	);
	const sectionSubjectId = subjectAssignment?.id ?? null;

	const homework = useHomeworkListQuery(
		tenantId,
		sectionSubjectId ?? undefined,
		Boolean(sectionSubjectId),
	);
	const assessments = useAssessmentListQuery(
		tenantId,
		sectionSubjectId ?? undefined,
		Boolean(sectionSubjectId),
	);

	const filteredStudents = useMemo(() => {
		const rows = students.data?.students ?? [];
		const query = search.trim().toLowerCase();
		if (!query) return rows;
		return rows.filter(
			(row) =>
				row.student.fullName.toLowerCase().includes(query) ||
				row.student.studentCode.toLowerCase().includes(query),
		);
	}, [students.data, search]);

	if (profile.isLoading) {
		return (
			<View style={styles.container}>
				<SafeAreaView edges={["top"]} style={styles.safeArea}>
					<ScreenHeader title="Class" />
					<View style={styles.loading}>
						<ActivityIndicator color={AppColors.primary.brand} size="large" />
						<Text style={styles.loadingText}>Loading class…</Text>
					</View>
				</SafeAreaView>
			</View>
		);
	}

	const isHomeroom = section?.accessType === "homeroom";
	const hasSubject = Boolean(sectionSubjectId);

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<ScreenHeader
					title={section?.name ?? "Class"}
					subtitle={
						isHomeroom
							? "Homeroom"
							: `${subjectAssignment?.subjectName} · ${subjectAssignment?.subjectCode}`
					}
				/>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.hero}>
						<View style={styles.heroRow}>
							<View style={styles.heroIcon}>
								<GraduationCap size={26} color={AppColors.primary.brand} strokeWidth={2} />
							</View>
							<View style={styles.heroCopy}>
								<Text style={styles.heroTitle}>{section?.name}</Text>
								<Text style={styles.heroMeta}>
									{subjectAssignment?.subjectName ?? "Homeroom"}
									{subjectAssignment?.subjectCode ? ` · ${subjectAssignment.subjectCode}` : ""}
								</Text>
							</View>
							<StatusBadge
								label={isHomeroom ? "Homeroom" : "Subject"}
								status={isHomeroom ? "pending" : "brand"}
								size="sm"
							/>
						</View>
						<View style={styles.heroFooter}>
							<View style={styles.heroStat}>
								<Users size={15} color={AppColors.text.secondary} />
								<Text style={styles.heroStatText}>
									{students.data?.students.length ?? "—"} students
								</Text>
							</View>
							<View style={styles.heroStat}>
								<BookOpen size={15} color={AppColors.text.secondary} />
								<Text style={styles.heroStatText}>
									{homework.data?.assignments.length ?? 0} homework ·{" "}
									{assessments.data?.assessments.length ?? 0} tests
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.quickActions}>
						<QuickAction
							icon={ClipboardCheck}
							label="Attendance"
							color={AppColors.status.present}
							background={AppColors.status.presentBg}
							onPress={() => router.push(`/attendance/${sectionId}`)}
						/>
						<QuickAction
							icon={NotebookPen}
							label="Assign homework"
							color={AppColors.primary.brand}
							background={AppColors.primary.subtle}
							onPress={hasSubject ? () => setHomeworkSheet(true) : undefined}
						/>
						<QuickAction
							icon={CalendarPlus}
							label="Schedule test"
							color={AppColors.accent.purple}
							background="#F3E8FF"
							onPress={hasSubject ? () => setAssessmentSheet(true) : undefined}
						/>
						<QuickAction
							icon={FileText}
							label="Gradebook"
							color={AppColors.status.late}
							background={AppColors.status.lateBg}
							onPress={hasSubject ? () => router.push(`/gradebook/${sectionId}`) : undefined}
						/>
					</View>

					<View style={styles.segmentWrap}>
						<Segmented
							value={segment}
							onChange={setSegment}
							options={[
								{ label: "Students", value: "students" },
								...(hasSubject
									? ([
											{ label: "Homework", value: "homework" },
											{ label: "Tests", value: "assessments" },
										] as const)
									: []),
							]}
						/>
					</View>

					{segment === "students" ? (
						<View style={styles.section}>
							<View style={styles.searchBar}>
								<Search size={16} color={AppColors.text.muted} strokeWidth={2} />
								<TextInput
									style={styles.searchInput}
									placeholder="Search students by name or code"
									placeholderTextColor={AppColors.text.muted}
									value={search}
									onChangeText={setSearch}
								/>
								{search ? (
									<Pressable onPress={() => setSearch("")} hitSlop={8}>
										<Text style={styles.clearText}>Clear</Text>
									</Pressable>
								) : null}
							</View>

							{students.isLoading ? (
								<View style={styles.inlineLoading}>
									<ActivityIndicator color={AppColors.primary.brand} />
								</View>
							) : filteredStudents.length === 0 ? (
								<EmptyState
									icon={Users}
									title={search ? "No matching students" : "No students enrolled"}
									description={
										search
											? "Try a different name or student code."
											: "Students appear here once enrolled in this section."
									}
								/>
							) : (
								<View style={styles.roster}>
									{filteredStudents.map((row, index) => (
										<StudentRow
											key={row.student.id}
											name={row.student.fullName}
											code={row.student.studentCode}
											photoUrl={row.student.photoUrl}
											rollNumber={row.enrollment.rollNumber}
											status={row.student.status}
											last={index === filteredStudents.length - 1}
											onPress={() =>
												router.push(
													`/student/${row.student.id}?name=${encodeURIComponent(row.student.fullName)}`,
												)
											}
										/>
									))}
								</View>
							)}
						</View>
					) : null}

					{segment === "homework" ? (
						<View style={styles.section}>
							<View style={styles.sectionTitleRow}>
								<Text style={styles.sectionTitle}>Homework</Text>
								<Pressable onPress={() => setHomeworkSheet(true)} style={styles.addLink}>
									<Text style={styles.addLinkText}>+ Assign</Text>
								</Pressable>
							</View>
							{homework.isLoading ? (
								<View style={styles.inlineLoading}>
									<ActivityIndicator color={AppColors.primary.brand} />
								</View>
							) : homework.data?.assignments.length ? (
								<View style={styles.groupCard}>
									{homework.data.assignments.map((item, index) => (
										<ListRow
											key={item.id}
											icon={BookOpen}
											iconColor={AppColors.primary.brand}
											iconBackground={AppColors.primary.subtle}
											title={item.title}
											subtitle={
												item.dueAt
													? `Due ${formatFullDate(item.dueAt)} · ${item.recipientCount} students`
													: `${item.recipientCount} students`
											}
											badge={{ label: item.status, status: homeworkStatusVariant[item.status] }}
											last={index === homework.data.assignments.length - 1}
											onPress={() => router.push(`/homework/${item.id}`)}
										/>
									))}
								</View>
							) : (
								<EmptyState
									icon={NotebookPen}
									title="No homework yet"
									description="Assign your first homework to this class."
								/>
							)}
						</View>
					) : null}

					{segment === "assessments" ? (
						<View style={styles.section}>
							<View style={styles.sectionTitleRow}>
								<Text style={styles.sectionTitle}>Tests & exams</Text>
								<Pressable onPress={() => setAssessmentSheet(true)} style={styles.addLink}>
									<Text style={styles.addLinkText}>+ Schedule</Text>
								</Pressable>
							</View>
							{assessments.isLoading ? (
								<View style={styles.inlineLoading}>
									<ActivityIndicator color={AppColors.primary.brand} />
								</View>
							) : assessments.data?.assessments.length ? (
								<View style={styles.groupCard}>
									{assessments.data.assessments.map((item, index) => (
										<AssessmentRow
											key={item.id}
											item={item}
											last={index === Math.max(0, (assessments.data?.assessments.length ?? 0) - 1)}
										/>
									))}
								</View>
							) : (
								<EmptyState
									icon={CalendarPlus}
									title="No tests scheduled"
									description="Schedule a quiz, test, or exam for this class."
								/>
							)}
						</View>
					) : null}
				</ScrollView>

				{sectionSubjectId ? (
					<AssignHomeworkSheet
						visible={homeworkSheet}
						onClose={() => setHomeworkSheet(false)}
						tenantId={tenantId}
						sectionSubjectId={sectionSubjectId}
					/>
				) : null}
				{sectionSubjectId ? (
					<ScheduleAssessmentSheet
						visible={assessmentSheet}
						onClose={() => setAssessmentSheet(false)}
						tenantId={tenantId}
						sectionSubjectId={sectionSubjectId}
					/>
				) : null}
			</SafeAreaView>
		</View>
	);
}

function QuickAction({
	icon: Icon,
	label,
	color,
	background,
	onPress,
}: {
	icon: typeof ClipboardCheck;
	label: string;
	color: string;
	background: string;
	onPress?: () => void;
}) {
	return (
		<Pressable
			style={({ pressed }) => [styles.quickAction, pressed && styles.pressedTile]}
			onPress={onPress}
		>
			<View style={[styles.quickIcon, { backgroundColor: background }]}>
				<Icon size={24} color={color} strokeWidth={2} />
			</View>
			<Text style={styles.quickLabel} numberOfLines={2}>
				{label}
			</Text>
		</Pressable>
	);
}

function StudentRow({
	name,
	code,
	photoUrl,
	rollNumber,
	status,
	last,
	onPress,
}: {
	name: string;
	code: string;
	photoUrl: string | null;
	rollNumber?: string | null;
	status: string;
	last: boolean;
	onPress: () => void;
}) {
	const avatar =
		resolveMediaUrl(photoUrl) ?? `https://avatar.vercel.sh/${encodeURIComponent(code)}`;
	return (
		<Pressable
			style={({ pressed }) => [
				styles.studentRow,
				!last && styles.studentDivider,
				pressed && styles.pressedRow,
			]}
			onPress={onPress}
		>
			<Image source={{ uri: avatar }} style={styles.avatar} />
			<View style={styles.studentCopy}>
				<Text style={styles.studentName}>{name}</Text>
				<Text style={styles.studentMeta}>
					{rollNumber ? `Roll ${rollNumber} · ` : ""}
					{code}
				</Text>
			</View>
			<StatusBadge label={status} status={status === "active" ? "present" : "pending"} size="sm" />
		</Pressable>
	);
}

function AssessmentRow({ item, last }: { item: Assessment; last: boolean }) {
	return (
		<ListRow
			icon={CalendarPlus}
			iconColor={AppColors.accent.purple}
			iconBackground="#F3E8FF"
			title={item.title}
			subtitle={`${formatDate(item.assessedOn)} · max ${item.maxScore} · ${item.recipientCount} students`}
			badge={{ label: item.status, status: assessmentStatusVariant[item.status] }}
			last={last}
			onPress={() => router.push(`/assessment/${item.id}`)}
		/>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	content: { paddingBottom: 48 },
	loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, marginTop: 120 },
	loadingText: { color: AppColors.text.secondary, fontSize: 14 },
	hero: {
		marginHorizontal: 16,
		marginTop: 8,
		backgroundColor: AppColors.surface,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		padding: 16,
		...AppShadows.sm,
	},
	heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
	heroIcon: {
		width: 52,
		height: 52,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	heroCopy: { flex: 1, gap: 2 },
	heroTitle: {
		color: AppColors.text.primary,
		fontSize: 19,
		fontWeight: "800",
		letterSpacing: -0.3,
	},
	heroMeta: { color: AppColors.text.secondary, fontSize: 13 },
	heroFooter: {
		flexDirection: "row",
		alignItems: "center",
		gap: 18,
		marginTop: 14,
		paddingTop: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	heroStat: { flexDirection: "row", alignItems: "center", gap: 6 },
	heroStatText: { color: AppColors.text.secondary, fontSize: 12, fontWeight: "600" },
	quickActions: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		paddingHorizontal: 16,
		marginTop: 14,
	},
	quickAction: {
		width: "48%",
		flexGrow: 1,
		alignItems: "center",
		backgroundColor: AppColors.surface,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		borderRadius: 16,
		paddingVertical: 14,
		gap: 8,
		...AppShadows.sm,
	},
	quickIcon: {
		width: 46,
		height: 46,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	quickLabel: {
		color: AppColors.text.primary,
		fontSize: 12,
		fontWeight: "700",
		textAlign: "center",
		paddingHorizontal: 6,
	},
	pressedTile: { opacity: 0.85, transform: [{ scale: 0.98 }] },
	segmentWrap: { paddingHorizontal: 16, marginTop: 18 },
	section: { paddingHorizontal: 16, marginTop: 14 },
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		backgroundColor: AppColors.surface,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		borderRadius: 12,
		paddingHorizontal: 12,
		height: 44,
	},
	searchInput: { flex: 1, color: AppColors.text.primary, fontSize: 14 },
	clearText: { color: AppColors.primary.brand, fontSize: 13, fontWeight: "600" },
	roster: {
		marginTop: 12,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
	},
	studentRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	studentDivider: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: AppColors.card.border,
	},
	pressedRow: { opacity: 0.7 },
	avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: AppColors.card.subtle },
	studentCopy: { flex: 1, gap: 2 },
	studentName: { color: AppColors.text.primary, fontSize: 15, fontWeight: "600" },
	studentMeta: { color: AppColors.text.secondary, fontSize: 12 },
	inlineLoading: { paddingVertical: 40, alignItems: "center" },
	sectionTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	sectionTitle: {
		color: AppColors.text.primary,
		fontSize: 16,
		fontWeight: "800",
		letterSpacing: -0.2,
	},
	addLink: { paddingVertical: 4, paddingHorizontal: 8 },
	addLinkText: { color: AppColors.primary.brand, fontSize: 13, fontWeight: "700" },
	groupCard: {
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
	},
});
