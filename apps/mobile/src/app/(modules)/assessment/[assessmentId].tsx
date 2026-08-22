import { useLocalSearchParams } from "expo-router";
import { AlarmClock, CalendarCheck, ClipboardCheck, DoorOpen, Trophy } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import type { AssessmentResultStatus } from "@/modules/teacher";
import { useAssessmentDetailQuery, useUpsertAssessmentResultsMutation } from "@/modules/teacher";
import { IconTile } from "@/modules/teacher/components/icon-tile";
import { ScreenHeader } from "@/modules/teacher/components/screen-header";
import {
	assessmentStatusVariant,
	assessmentTypeLabel,
	formatDate,
	formatMinutes,
} from "@/modules/teacher/lib/format";

export default function AssessmentDetailScreen() {
	const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;

	const detail = useAssessmentDetailQuery(tenantId, assessmentId);
	const upsert = useUpsertAssessmentResultsMutation(tenantId, assessmentId);

	const [scores, setScores] = useState<Record<string, string>>({});
	const [statuses, setStatuses] = useState<Record<string, AssessmentResultStatus>>({});
	const [saved, setSaved] = useState(false);

	const assessment = detail.data?.assessment;
	const results = assessment?.results ?? [];

	const scoreOf = (studentId: string): string => {
		if (scores[studentId] !== undefined) return scores[studentId];
		return results.find((result) => result.studentId === studentId)?.score?.toString() ?? "";
	};

	const statusOf = (studentId: string): AssessmentResultStatus => {
		if (statuses[studentId]) return statuses[studentId];
		return results.find((result) => result.studentId === studentId)?.status ?? "pending";
	};

	const setScore = (studentId: string, value: string) => {
		setSaved(false);
		const numeric = value.replace(/[^0-9.]/g, "");
		setScores((prev) => ({ ...prev, [studentId]: numeric }));
		if (numeric) setStatuses((prev) => ({ ...prev, [studentId]: "graded" }));
	};

	const setStatus = (studentId: string, status: AssessmentResultStatus) => {
		setSaved(false);
		setStatuses((prev) => ({ ...prev, [studentId]: status }));
	};

	const changedCount = useMemo(() => {
		const changedScores = Object.values(scores).filter((value) => value !== "").length;
		return Object.keys(statuses).length + changedScores;
	}, [scores, statuses]);

	const handleSave = () => {
		const entries = results.map((result) => ({
			studentId: result.studentId,
			score: scoreOf(result.studentId) ? Number(scoreOf(result.studentId)) : null,
			status: statusOf(result.studentId),
		}));
		upsert.mutate(
			{ results: entries },
			{
				onSuccess: () => {
					setScores({});
					setStatuses({});
					setSaved(true);
				},
			},
		);
	};

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<ScreenHeader title="Assessment" subtitle={assessment?.sectionName ?? "Test"} />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
				>
					{detail.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={Colors.brand.base} size="large" />
						</View>
					) : assessment ? (
						<>
							<View style={styles.hero}>
								<View style={styles.heroRow}>
									<IconTile
										icon={Trophy}
										color={Colors.accent.purple.fg}
										background="#F3E8FF"
										size={46}
										iconSize={22}
									/>
									<View style={styles.heroCopy}>
										<Text style={styles.heroTitle}>{assessment.title}</Text>
										<Text style={styles.heroMeta}>
											{assessmentTypeLabel[assessment.type]} · {assessment.subjectName}
										</Text>
									</View>
									<StatusBadge
										label={assessment.status}
										status={assessmentStatusVariant[assessment.status]}
										size="sm"
									/>
								</View>

								<View style={styles.metaGrid}>
									<MetaItem
										icon={CalendarCheck}
										label="Date"
										value={formatDate(assessment.assessedOn)}
									/>
									<MetaItem icon={Trophy} label="Max score" value={`${assessment.maxScore}`} />
									<MetaItem
										icon={AlarmClock}
										label="Duration"
										value={formatMinutes(assessment.durationMinutes)}
									/>
									<MetaItem icon={DoorOpen} label="Room" value={assessment.room ?? "—"} />
								</View>

								{assessment.instructions ? (
									<View style={styles.instructionsBlock}>
										<Text style={styles.blockLabel}>INSTRUCTIONS</Text>
										<Text style={styles.instructionsText}>{assessment.instructions}</Text>
									</View>
								) : null}

								{assessment.summary ? (
									<View style={styles.summaryRow}>
										<SummaryPill
											label="Graded"
											value={assessment.summary.graded}
											color={Colors.status.present.solid}
										/>
										<SummaryPill
											label="Pending"
											value={assessment.summary.pending}
											color={Colors.status.pending.solid}
										/>
										<SummaryPill
											label="Absent"
											value={assessment.summary.absent}
											color={Colors.status.absent.solid}
										/>
										<SummaryPill
											label="Average"
											value={
												assessment.summary.averageScore != null
													? `${assessment.summary.averageScore}`
													: "—"
											}
											color={Colors.brand.base}
										/>
									</View>
								) : null}
							</View>

							<Text style={styles.sectionLabel}>MARKS ENTRY</Text>
							<View style={styles.roster}>
								{results.map((result, index) => {
									const status = statusOf(result.studentId);
									return (
										<View
											key={result.studentId}
											style={[styles.resultRow, index > 0 && styles.rowDivider]}
										>
											<View style={styles.resultCopy}>
												<Text style={styles.studentName}>{result.studentName}</Text>
												<Text style={styles.studentMeta}>{result.studentCode}</Text>
											</View>
											<View style={styles.statusOptions}>
												<Pressable
													style={[
														styles.statusChip,
														status === "graded" && styles.statusChipGraded,
													]}
													onPress={() =>
														setStatus(result.studentId, status === "graded" ? "pending" : "graded")
													}
												>
													<Text
														style={[
															styles.statusChipText,
															status === "graded" && styles.statusChipTextGraded,
														]}
													>
														Graded
													</Text>
												</Pressable>
												<Pressable
													style={[
														styles.statusChip,
														status === "absent" && styles.statusChipAbsent,
													]}
													onPress={() =>
														setStatus(result.studentId, status === "absent" ? "pending" : "absent")
													}
												>
													<Text
														style={[
															styles.statusChipText,
															status === "absent" && styles.statusChipTextAbsent,
														]}
													>
														Absent
													</Text>
												</Pressable>
											</View>
											<View style={styles.scoreField}>
												<TextInput
													style={styles.scoreInput}
													value={scoreOf(result.studentId)}
													onChangeText={(value) => setScore(result.studentId, value)}
													keyboardType="decimal-pad"
													placeholder={`/${assessment.maxScore}`}
													placeholderTextColor={Colors.text.muted}
												/>
											</View>
										</View>
									);
								})}
							</View>

							{saved ? <Text style={styles.savedText}>✓ Marks saved</Text> : null}
						</>
					) : (
						<EmptyState
							icon={Trophy}
							title="Assessment not found"
							description="This assessment may have been removed."
						/>
					)}
				</ScrollView>
			</SafeAreaView>

			{assessment ? (
				<View style={styles.saveBar}>
					<Button
						label={changedCount > 0 ? "Save marks" : "Save marks"}
						icon={ClipboardCheck}
						size="lg"
						loading={upsert.isPending}
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
			<Icon size={15} color={Colors.text.muted} strokeWidth={2} />
			<Text style={styles.metaLabel}>{label}</Text>
			<Text style={styles.metaValue}>{value}</Text>
		</View>
	);
}

function SummaryPill({
	label,
	value,
	color,
}: {
	label: string;
	value: string | number;
	color: string;
}) {
	return (
		<View style={styles.summaryPill}>
			<Text style={[styles.summaryPillValue, { color }]}>{value}</Text>
			<Text style={styles.summaryPillLabel}>{label}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.canvas },
	safeArea: { flex: 1 },
	content: { paddingBottom: 110 },
	loading: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
	hero: {
		marginHorizontal: 16,
		marginTop: 8,
		backgroundColor: Colors.surface,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: Colors.border.base,
		padding: 16,
		...Elevation.raised,
	},
	heroRow: { flexDirection: "row", alignItems: "center", gap: 12 },
	heroCopy: { flex: 1, gap: 2 },
	heroTitle: { ...Type.title, fontSize: Tokens.fontSize["3xl"] },
	heroMeta: Type.caption,
	metaGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginTop: 14,
		paddingTop: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.base,
	},
	metaItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		width: "47%",
		flexGrow: 1,
	},
	metaLabel: Type.caption,
	metaValue: {
		...Type.meta,
		color: Colors.text.primary,
		fontWeight: Tokens.fontWeight.semibold,
		flex: 1,
	},
	instructionsBlock: { marginTop: 14 },
	blockLabel: {
		color: Colors.text.muted,
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 0,
		marginBottom: 6,
	},
	instructionsText: Type.body,
	summaryRow: { flexDirection: "row", gap: 8, marginTop: 14 },
	summaryPill: {
		flex: 1,
		alignItems: "center",
		backgroundColor: Colors.canvas,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.border.base,
		paddingVertical: 10,
	},
	summaryPillValue: { fontSize: 17, fontWeight: "800" },
	summaryPillLabel: { color: Colors.text.muted, fontSize: 10, fontWeight: "600", marginTop: 1 },
	sectionLabel: {
		...Type.overline,
		marginHorizontal: 16,
		marginTop: 22,
		marginBottom: 10,
	},
	roster: {
		marginHorizontal: 16,
		backgroundColor: Colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: Colors.border.base,
		overflow: "hidden",
	},
	resultRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingHorizontal: 14,
		paddingVertical: 11,
	},
	rowDivider: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.base,
	},
	resultCopy: { flex: 1, gap: 2 },
	studentName: { ...Type.meta, color: Colors.text.primary, fontWeight: Tokens.fontWeight.semibold },
	studentMeta: Type.caption,
	statusOptions: { flexDirection: "row", gap: 6 },
	statusChip: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: Colors.border.base,
		backgroundColor: Colors.canvas,
	},
	statusChipGraded: { backgroundColor: Colors.status.present.bg, borderColor: "#BBF7D0" },
	statusChipAbsent: { backgroundColor: Colors.status.absent.bg, borderColor: "#FECACA" },
	statusChipText: { color: Colors.text.secondary, fontSize: 11, fontWeight: "600" },
	statusChipTextGraded: { color: Colors.status.present.solid, fontWeight: "700" },
	statusChipTextAbsent: { color: Colors.status.absent.solid, fontWeight: "700" },
	scoreField: { width: 72 },
	scoreInput: {
		borderWidth: 1,
		borderColor: Colors.border.base,
		borderRadius: 10,
		backgroundColor: Colors.canvas,
		paddingHorizontal: 10,
		paddingVertical: 8,
		color: Colors.text.primary,
		fontSize: 14,
		fontWeight: "700",
		textAlign: "center",
	},
	savedText: {
		color: Colors.status.present.solid,
		fontSize: 13,
		fontWeight: "600",
		textAlign: "center",
		marginTop: 14,
	},
	saveBar: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 14,
		backgroundColor: Colors.surface,
		borderTopWidth: 1,
		borderTopColor: Colors.border.base,
	},
	saveButton: { width: "100%" },
});
