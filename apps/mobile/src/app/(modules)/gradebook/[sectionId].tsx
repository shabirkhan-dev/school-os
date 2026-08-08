import { useLocalSearchParams } from "expo-router";
import { BarChart3, BookOpen, Users } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { AppColors, AppShadows } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import type { GradebookCell, GradebookTerm } from "@/modules/teacher";
import { useGradebookQuery, useTeacherProfileQuery } from "@/modules/teacher";
import { Chip } from "@/modules/teacher/components/chip";
import { MetricCard } from "@/modules/teacher/components/metric-card";
import { ProgressBar } from "@/modules/teacher/components/progress-bar";
import { ScreenHeader } from "@/modules/teacher/components/screen-header";

const TERMS: GradebookTerm[] = ["term1", "term2", "term3", "final"];

export default function GradebookScreen() {
	const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;
	const [term, setTerm] = useState<GradebookTerm>("term1");

	const profile = useTeacherProfileQuery(tenantId);
	const grid = useGradebookQuery(tenantId, sectionId, term);

	const section = profile.data?.accessibleSections.find((item) => item.id === sectionId);
	const subjectAssignment = profile.data?.subjectAssignments.find(
		(assignment) => assignment.sectionId === sectionId,
	);

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<ScreenHeader
					title="Gradebook"
					subtitle={section?.name ?? "Class"}
					right={
						<View style={styles.termPill}>
							<BarChart3 size={14} color={AppColors.primary.brand} />
							<Text style={styles.termPillText}>{term.toUpperCase()}</Text>
						</View>
					}
				/>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
					<View style={styles.termRow}>
						{TERMS.map((item) => (
							<Chip
								key={item}
								label={item.replace("term", "Term ")}
								selected={term === item}
								onPress={() => setTerm(item)}
							/>
						))}
					</View>

					{grid.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={AppColors.primary.brand} size="large" />
							<Text style={styles.loadingText}>Loading gradebook…</Text>
						</View>
					) : grid.data ? (
						<>
							<View style={styles.metrics}>
								<MetricCard
									label="Students"
									value={grid.data.rows.length}
									hint={`${grid.data.subjects.length} subjects`}
									icon={Users}
								/>
								<MetricCard
									label="Subject"
									value={subjectAssignment?.subjectCode ?? "—"}
									hint={subjectAssignment?.subjectName ?? "No subject"}
									icon={BookOpen}
									color={AppColors.status.late}
									background={AppColors.status.lateBg}
								/>
							</View>

							<Text style={styles.sectionLabel}>SUBJECT AVERAGES</Text>
							<View style={styles.subjectCard}>
								{grid.data.subjects.length === 0 ? (
									<Text style={styles.emptyText}>
										No grades recorded for this term yet. Assessments feed in automatically.
									</Text>
								) : (
									grid.data.subjects.map((subject, index) => {
										const average = grid.data.averages[subject.id];
										return (
											<View
												key={subject.id}
												style={[styles.subjectRow, index > 0 && styles.rowDivider]}
											>
												<View style={styles.subjectCopy}>
													<Text style={styles.subjectName}>{subject.name}</Text>
													<Text style={styles.subjectCode}>{subject.code}</Text>
												</View>
												<View style={styles.subjectRight}>
													{average != null ? (
														<>
															<View style={styles.subjectBar}>
																<ProgressBar
																	value={average}
																	color={averageColor(average)}
																	height={5}
																/>
															</View>
															<Text style={styles.subjectAverage}>{Math.round(average)}%</Text>
														</>
													) : (
														<Text style={styles.emptyText}>No data</Text>
													)}
												</View>
											</View>
										);
									})
								)}
							</View>

							<Text style={styles.sectionLabel}>STUDENTS</Text>
							<View style={styles.studentCard}>
								{grid.data.rows.length === 0 ? (
									<Text style={styles.emptyText}>No students in this class.</Text>
								) : (
									grid.data.rows.map((row, index) => {
										const cells = Object.values(row.cells) as GradebookCell[];
										const overall =
											cells.length > 0
												? Math.round(
														cells.reduce((sum, cell) => sum + cell.percentage, 0) / cells.length,
													)
												: null;
										return (
											<View
												key={row.studentId}
												style={[styles.studentRow, index > 0 && styles.rowDivider]}
											>
												<View style={styles.studentHeader}>
													<View style={styles.studentCopy}>
														<Text style={styles.studentName}>{row.studentName}</Text>
														<Text style={styles.studentCode}>{row.studentCode}</Text>
													</View>
													<View style={styles.overall}>
														<Text
															style={[
																styles.overallValue,
																{
																	color:
																		overall == null ? AppColors.text.muted : averageColor(overall),
																},
															]}
														>
															{overall == null ? "—" : `${overall}%`}
														</Text>
														<Text style={styles.overallLabel}>overall</Text>
													</View>
												</View>
												{cells.length > 0 ? (
													<View style={styles.cellsWrap}>
														{cells.slice(0, 4).map((cell, cellIndex) => {
															const subject = grid.data?.subjects[cellIndex];
															return (
																<View key={`${row.studentId}-${cellIndex}`} style={styles.cell}>
																	<Text style={styles.cellSubject}>{subject?.code ?? "—"}</Text>
																	<Text
																		style={[
																			styles.cellValue,
																			{ color: averageColor(cell.percentage) },
																		]}
																	>
																		{Math.round(cell.percentage)}%
																	</Text>
																	<Text style={styles.cellGrade}>{cell.grade}</Text>
																</View>
															);
														})}
													</View>
												) : (
													<Text style={styles.emptyText}>No grades yet</Text>
												)}
											</View>
										);
									})
								)}
							</View>
						</>
					) : (
						<EmptyState
							icon={BarChart3}
							title="Gradebook unavailable"
							description="We could not load this class’s gradebook."
						/>
					)}
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function averageColor(value: number): string {
	if (value >= 80) return AppColors.status.present;
	if (value >= 60) return AppColors.primary.brand;
	if (value >= 40) return AppColors.status.late;
	return AppColors.status.absent;
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	content: { paddingBottom: 48 },
	termPill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		backgroundColor: AppColors.primary.subtle,
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	termPillText: {
		color: AppColors.primary.brand,
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 0,
	},
	termRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, marginTop: 10 },
	loading: { alignItems: "center", gap: 10, paddingVertical: 60 },
	loadingText: { color: AppColors.text.secondary, fontSize: 13 },
	metrics: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
	sectionLabel: {
		color: AppColors.text.muted,
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 0,
		marginHorizontal: 16,
		marginTop: 22,
		marginBottom: 10,
	},
	subjectCard: {
		marginHorizontal: 16,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
		...AppShadows.sm,
	},
	subjectRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	rowDivider: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	subjectCopy: { flex: 1, gap: 1 },
	subjectName: { color: AppColors.text.primary, fontSize: 14, fontWeight: "600" },
	subjectCode: { color: AppColors.text.muted, fontSize: 11 },
	subjectRight: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, maxWidth: "55%" },
	subjectBar: { flex: 1 },
	subjectAverage: {
		color: AppColors.text.primary,
		fontSize: 14,
		fontWeight: "800",
		width: 44,
		textAlign: "right",
	},
	studentCard: {
		marginHorizontal: 16,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
	},
	studentRow: { paddingHorizontal: 14, paddingVertical: 12 },
	studentHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
	studentCopy: { flex: 1, gap: 1 },
	studentName: { color: AppColors.text.primary, fontSize: 14, fontWeight: "600" },
	studentCode: { color: AppColors.text.muted, fontSize: 11 },
	overall: { alignItems: "flex-end" },
	overallValue: { fontSize: 18, fontWeight: "800" },
	overallLabel: { color: AppColors.text.muted, fontSize: 10, fontWeight: "600" },
	cellsWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		marginTop: 10,
	},
	cell: {
		alignItems: "center",
		backgroundColor: AppColors.background,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 6,
		minWidth: 58,
	},
	cellSubject: { color: AppColors.text.muted, fontSize: 10, fontWeight: "700" },
	cellValue: { fontSize: 14, fontWeight: "800", marginTop: 1 },
	cellGrade: { color: AppColors.text.muted, fontSize: 10, fontWeight: "600" },
	emptyText: {
		color: AppColors.text.muted,
		fontSize: 13,
		paddingVertical: 12,
		textAlign: "center",
	},
});
