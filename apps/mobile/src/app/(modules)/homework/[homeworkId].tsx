import { useLocalSearchParams } from "expo-router";
import { AlarmClock, BookOpen, CheckCircle2, ClipboardCheck, FileText } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { AppColors, AppShadows } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import type { HomeworkSubmissionStatus } from "@/modules/teacher";
import {
	useBulkUpdateSubmissionsMutation,
	useHomeworkDetailQuery,
	useHomeworkSubmissionsQuery,
	useUpdateHomeworkMutation,
} from "@/modules/teacher";
import { IconTile } from "@/modules/teacher/components/icon-tile";
import { ScreenHeader } from "@/modules/teacher/components/screen-header";
import {
	formatDateTime,
	formatFullDate,
	formatMinutes,
	homeworkStatusVariant,
	submissionStatusVariant,
} from "@/modules/teacher/lib/format";

const SUBMISSION_OPTIONS: HomeworkSubmissionStatus[] = [
	"pending",
	"submitted",
	"late",
	"graded",
	"excused",
];

export default function HomeworkDetailScreen() {
	const { homeworkId } = useLocalSearchParams<{ homeworkId: string }>();
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;

	const detail = useHomeworkDetailQuery(tenantId, homeworkId);
	const submissions = useHomeworkSubmissionsQuery(tenantId, homeworkId);
	const updateHomework = useUpdateHomeworkMutation(tenantId, homeworkId);
	const bulkUpdate = useBulkUpdateSubmissionsMutation(tenantId, homeworkId);

	const [changes, setChanges] = useState<Record<string, HomeworkSubmissionStatus>>({});
	const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

	const assignment = detail.data?.assignment;

	const handleSetStatus = (studentId: string, status: HomeworkSubmissionStatus) => {
		setChanges((prev) => ({ ...prev, [studentId]: status }));
		setExpandedStudentId(null);
	};

	const handleSave = () => {
		const entries = Object.entries(changes).map(([studentId, status]) => ({ studentId, status }));
		if (entries.length === 0) return;
		bulkUpdate.mutate(
			{ submissions: entries },
			{
				onSuccess: () => setChanges({}),
			},
		);
	};

	const currentStatusOf = (studentId: string): HomeworkSubmissionStatus => {
		if (changes[studentId]) return changes[studentId];
		return (
			submissions.data?.submissions.find((item) => item.studentId === studentId)?.status ??
			"pending"
		);
	};

	const summary = submissions.data?.summary;

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<ScreenHeader title="Homework" subtitle={assignment?.sectionName ?? "Assignment"} />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
				>
					{detail.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={AppColors.primary.brand} size="large" />
						</View>
					) : assignment ? (
						<>
							<View style={styles.hero}>
								<View style={styles.heroRow}>
									<IconTile
										icon={BookOpen}
										color={AppColors.primary.brand}
										size={46}
										iconSize={22}
									/>
									<View style={styles.heroCopy}>
										<Text style={styles.heroTitle}>{assignment.title}</Text>
										<Text style={styles.heroMeta}>
											{assignment.subjectName}
											{assignment.subjectCode ? ` · ${assignment.subjectCode}` : ""}
										</Text>
									</View>
									<StatusBadge
										label={assignment.status}
										status={homeworkStatusVariant[assignment.status]}
										size="sm"
									/>
								</View>

								<View style={styles.metaGrid}>
									<MetaItem
										icon={AlarmClock}
										label="Due"
										value={formatFullDate(assignment.dueAt)}
									/>
									<MetaItem
										icon={FileText}
										label="Time"
										value={formatMinutes(assignment.estimatedMinutes)}
									/>
									<MetaItem
										icon={CheckCircle2}
										label="Students"
										value={`${assignment.recipientCount}`}
									/>
									<MetaItem
										icon={ClipboardCheck}
										label="Created"
										value={formatDateTime(assignment.createdAt)}
									/>
								</View>

								{assignment.description ? (
									<View style={styles.descriptionBlock}>
										<Text style={styles.blockLabel}>INSTRUCTIONS</Text>
										<Text style={styles.descriptionText}>{assignment.description}</Text>
									</View>
								) : null}

								{assignment.materials ? (
									<View style={styles.descriptionBlock}>
										<Text style={styles.blockLabel}>MATERIALS</Text>
										<Text style={styles.descriptionText}>{assignment.materials}</Text>
									</View>
								) : null}

								<View style={styles.statusChanger}>
									<Text style={styles.blockLabel}>STATUS</Text>
									<View style={styles.statusRow}>
										{(["draft", "published", "closed"] as const).map((status) => (
											<Pressable
												key={status}
												style={({ pressed }) => [
													styles.statusOption,
													assignment.status === status && styles.statusOptionActive,
													pressed && styles.pressedRow,
												]}
												onPress={() => {
													if (assignment.status !== status) {
														updateHomework.mutate({ status });
													}
												}}
											>
												<Text
													style={[
														styles.statusOptionText,
														assignment.status === status && styles.statusOptionTextActive,
													]}
												>
													{status}
												</Text>
											</Pressable>
										))}
									</View>
								</View>
							</View>

							<Text style={styles.sectionLabel}>SUBMISSIONS</Text>
							{submissions.isLoading ? (
								<View style={styles.loading}>
									<ActivityIndicator color={AppColors.primary.brand} />
								</View>
							) : submissions.data?.submissions.length ? (
								<>
									{summary ? (
										<View style={styles.summaryRow}>
											<SummaryPill
												label="Submitted"
												value={summary.submitted}
												color={AppColors.primary.brand}
											/>
											<SummaryPill
												label="Late"
												value={summary.late}
												color={AppColors.status.late}
											/>
											<SummaryPill
												label="Graded"
												value={summary.graded}
												color={AppColors.status.present}
											/>
											<SummaryPill
												label="Pending"
												value={summary.pending}
												color={AppColors.status.pending}
											/>
										</View>
									) : null}

									<View style={styles.roster}>
										{submissions.data.submissions.map((item, index) => {
											const status = currentStatusOf(item.studentId);
											const expanded = expandedStudentId === item.studentId;
											return (
												<View key={item.studentId}>
													<Pressable
														style={({ pressed }) => [
															styles.submissionRow,
															index > 0 && styles.rowDivider,
															pressed && styles.pressedRow,
														]}
														onPress={() => setExpandedStudentId(expanded ? null : item.studentId)}
													>
														<View style={styles.submissionCopy}>
															<Text style={styles.studentName}>{item.studentName}</Text>
															<Text style={styles.studentMeta}>
																{item.studentCode}
																{item.submittedAt ? ` · ${formatDateTime(item.submittedAt)}` : ""}
															</Text>
														</View>
														{item.marksObtained != null ? (
															<Text style={styles.marksText}>
																{item.marksObtained}
																{item.totalMarks ? `/${item.totalMarks}` : ""}
															</Text>
														) : null}
														<StatusBadge
															label={status}
															status={submissionStatusVariant[status]}
															size="sm"
														/>
													</Pressable>
													{expanded ? (
														<View style={[styles.statusOptions, index > 0 && styles.rowDivider]}>
															{SUBMISSION_OPTIONS.map((option) => {
																const selected = status === option;
																return (
																	<Pressable
																		key={option}
																		style={({ pressed }) => [
																			styles.optionChip,
																			selected && styles.optionChipActive,
																			pressed && styles.pressedRow,
																		]}
																		onPress={() => handleSetStatus(item.studentId, option)}
																	>
																		<Text
																			style={[
																				styles.optionText,
																				selected && styles.optionTextActive,
																			]}
																		>
																			{option}
																		</Text>
																	</Pressable>
																);
															})}
														</View>
													) : null}
												</View>
											);
										})}
									</View>
								</>
							) : (
								<EmptyState
									icon={BookOpen}
									title="No submissions yet"
									description="Student submissions will appear here."
								/>
							)}
						</>
					) : (
						<EmptyState
							icon={BookOpen}
							title="Assignment not found"
							description="This homework may have been removed."
						/>
					)}
				</ScrollView>
			</SafeAreaView>

			{Object.keys(changes).length > 0 ? (
				<View style={styles.saveBar}>
					<Button
						label={`Save ${Object.keys(changes).length} change${Object.keys(changes).length === 1 ? "" : "s"}`}
						icon={ClipboardCheck}
						size="lg"
						loading={bulkUpdate.isPending}
						onPress={handleSave}
						style={styles.saveButton}
					/>
				</View>
			) : null}
		</View>
	);
}

function MetaItem({
	icon: Icon,
	label,
	value,
}: {
	icon: typeof AlarmClock;
	label: string;
	value: string;
}) {
	return (
		<View style={styles.metaItem}>
			<Icon size={15} color={AppColors.text.muted} strokeWidth={2} />
			<Text style={styles.metaLabel}>{label}</Text>
			<Text style={styles.metaValue}>{value}</Text>
		</View>
	);
}

function SummaryPill({ label, value, color }: { label: string; value: number; color: string }) {
	return (
		<View style={styles.summaryPill}>
			<Text style={[styles.summaryPillValue, { color }]}>{value}</Text>
			<Text style={styles.summaryPillLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	content: { paddingBottom: 110 },
	loading: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
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
	heroCopy: { flex: 1, gap: 2 },
	heroTitle: {
		color: AppColors.text.primary,
		fontSize: 18,
		fontWeight: "800",
		letterSpacing: 0,
	},
	heroMeta: { color: AppColors.text.secondary, fontSize: 13 },
	metaGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 14,
		paddingTop: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		width: "47%",
		flexGrow: 1,
	},
	metaLabel: { color: AppColors.text.muted, fontSize: 11, fontWeight: "600" },
	metaValue: { color: AppColors.text.primary, fontSize: 12, fontWeight: "700", flex: 1 },
	descriptionBlock: { marginTop: 14 },
	blockLabel: {
		color: AppColors.text.muted,
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 0,
		marginBottom: 6,
	},
	descriptionText: { color: AppColors.text.secondary, fontSize: 14, lineHeight: 21 },
	statusChanger: { marginTop: 14 },
	statusRow: { flexDirection: "row", gap: 8 },
	statusOption: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		backgroundColor: AppColors.background,
	},
	statusOptionActive: {
		backgroundColor: AppColors.primary.main,
		borderColor: AppColors.primary.main,
	},
	statusOptionText: {
		color: AppColors.text.secondary,
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	statusOptionTextActive: { color: AppColors.text.inverse, fontWeight: "700" },
	pressedRow: { opacity: 0.7 },
	sectionLabel: {
		color: AppColors.text.muted,
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 0,
		marginHorizontal: 16,
		marginTop: 22,
		marginBottom: 10,
	},
	summaryRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 12 },
	summaryPill: {
		flex: 1,
		alignItems: "center",
		backgroundColor: AppColors.surface,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		paddingVertical: 10,
	},
	summaryPillValue: { fontSize: 18, fontWeight: "800" },
	summaryPillLabel: { color: AppColors.text.muted, fontSize: 10, fontWeight: "600", marginTop: 1 },
	roster: {
		marginHorizontal: 16,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
	},
	submissionRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	rowDivider: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	submissionCopy: { flex: 1, gap: 2 },
	studentName: { color: AppColors.text.primary, fontSize: 14, fontWeight: "600" },
	studentMeta: { color: AppColors.text.secondary, fontSize: 11 },
	marksText: {
		color: AppColors.text.primary,
		fontSize: 14,
		fontWeight: "800",
		fontVariant: ["tabular-nums"],
	},
	statusOptions: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 6,
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	optionChip: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		backgroundColor: AppColors.background,
	},
	optionChipActive: {
		backgroundColor: AppColors.primary.main,
		borderColor: AppColors.primary.main,
	},
	optionText: {
		color: AppColors.text.secondary,
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	optionTextActive: { color: AppColors.text.inverse, fontWeight: "700" },
	saveBar: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 14,
		backgroundColor: AppColors.surface,
		borderTopWidth: 1,
		borderTopColor: AppColors.card.border,
	},
	saveButton: { width: "100%" },
});
