import { useLocalSearchParams } from "expo-router";
import { CalendarDays, Check, ClipboardCheck, RefreshCw } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	ActivityIndicator,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";
import { resolveMediaUrl } from "@/lib/media-url";
import { useAuth } from "@/modules/auth";
import type { AttendanceMarkStatus } from "@/modules/teacher";
import {
	useConfirmAllPresentMutation,
	useGetOrCreateAttendanceSessionMutation,
	useMarkAttendanceMutation,
	useSectionStudentsQuery,
	useTeacherProfileQuery,
} from "@/modules/teacher";
import { ProgressBar } from "@/modules/teacher/components/progress-bar";
import { ScreenHeader } from "@/modules/teacher/components/screen-header";
import {
	attendanceStatusBackground,
	attendanceStatusColor,
	attendanceStatusLabel,
	localSessionDate,
} from "@/modules/teacher/lib/format";

const STATUS_OPTIONS: AttendanceMarkStatus[] = ["present", "absent", "late", "excused"];

export default function AttendanceScreen() {
	const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
	const { tenantContext } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;
	const sessionDate = useMemo(localSessionDate, []);

	const profile = useTeacherProfileQuery(tenantId);
	const students = useSectionStudentsQuery(tenantId, sectionId);
	const getOrCreate = useGetOrCreateAttendanceSessionMutation(tenantId);
	const markAttendance = useMarkAttendanceMutation(tenantId);
	const confirmAll = useConfirmAllPresentMutation(tenantId);

	const section = profile.data?.accessibleSections.find((item) => item.id === sectionId);
	const [marks, setMarks] = useState<Record<string, AttendanceMarkStatus>>({});
	const [loaded, setLoaded] = useState(false);
	const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
	const startedKey = useRef<string | null>(null);

	const loadSession = useCallback(() => {
		const key = `${sectionId}:${sessionDate}`;
		if (!tenantId || !sectionId || startedKey.current === key) return;
		// Guard against double-fire in dev StrictMode: only open the session once.
		startedKey.current = key;
		setLoaded(false);
		getOrCreate.mutate(
			{ sectionId, sessionDate, sessionType: "class" },
			{
				onSuccess: (view) => {
					const next: Record<string, AttendanceMarkStatus> = {};
					for (const mark of view.marks) next[mark.studentId] = mark.status;
					setMarks(next);
					setLoaded(true);
				},
				onError: () => setLoaded(true),
			},
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tenantId, sectionId, sessionDate]);

	useEffect(() => {
		if (!loaded && !getOrCreate.isPending) loadSession();
	}, [loaded, loadSession, getOrCreate.isPending]);

	const setStatus = (studentId: string, status: AttendanceMarkStatus) => {
		setMarks((prev) => ({ ...prev, [studentId]: status }));
	};

	const handleSave = () => {
		if (!tenantId) return;
		const sessionId = getOrCreate.data?.session.id;
		if (!sessionId) return;
		const entries = Object.entries(marks).map(([studentId, status]) => ({ studentId, status }));
		if (entries.length === 0) return;
		markAttendance.mutate(
			{ sessionId, input: { marks: entries } },
			{
				onSuccess: ({ marks: next }) => {
					const map: Record<string, AttendanceMarkStatus> = {};
					for (const mark of next) map[mark.studentId] = mark.status;
					setMarks(map);
				},
			},
		);
	};

	const handleAllPresent = () => {
		const sessionId = getOrCreate.data?.session.id;
		if (!tenantId || !sessionId) return;
		confirmAll.mutate(
			{ sessionId },
			{
				onSuccess: (view) => {
					const next: Record<string, AttendanceMarkStatus> = {};
					for (const mark of view.marks) next[mark.studentId] = mark.status;
					setMarks(next);
				},
			},
		);
	};

	const summary = useMemo(() => {
		const counts: Record<AttendanceMarkStatus, number> = {
			present: 0,
			absent: 0,
			late: 0,
			excused: 0,
			left_early: 0,
			unknown: 0,
		};
		for (const status of Object.values(marks)) counts[status] += 1;
		return counts;
	}, [marks]);

	const total = students.data?.students.length ?? 0;
	const marked = Object.keys(marks).length;
	const progress = total > 0 ? Math.round((marked / total) * 100) : 0;
	const sessionError = getOrCreate.isError || markAttendance.isError || confirmAll.isError;

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<ScreenHeader
					title="Mark attendance"
					subtitle={section?.name ?? "Class"}
					right={
						<View style={styles.datePill}>
							<CalendarDays size={14} color={Colors.brand.base} />
							<Text style={styles.dateText}>{formatShort(sessionDate)}</Text>
						</View>
					}
				/>
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.summaryCard}>
						<View style={styles.summaryHeader}>
							<View style={styles.summaryCopy}>
								<Text style={styles.summaryTitle}>Today’s roll</Text>
								<Text style={styles.summaryMeta}>
									{marked} of {total} students marked
								</Text>
							</View>
							<Text style={styles.progressText}>{progress}%</Text>
						</View>
						<ProgressBar
							value={progress}
							color={progress === 100 ? Colors.status.present.solid : Colors.brand.base}
						/>
						<View style={styles.legend}>
							{STATUS_OPTIONS.map((status) => (
								<View key={status} style={styles.legendItem}>
									<View
										style={[styles.legendDot, { backgroundColor: attendanceStatusColor(status) }]}
									/>
									<Text style={styles.legendLabel}>{attendanceStatusLabel(status)}</Text>
									<Text style={styles.legendValue}>{summary[status]}</Text>
								</View>
							))}
						</View>
					</View>

					<Button
						label="Mark all present"
						icon={Check}
						variant="secondary"
						size="md"
						loading={confirmAll.isPending}
						onPress={handleAllPresent}
						style={styles.allPresent}
					/>

					{sessionError ? (
						<View style={styles.errorRow}>
							<RefreshCw size={15} color={Colors.status.absent.solid} />
							<Text style={styles.errorText}>
								{getOrCreate.isError
									? "Could not open today’s session. Pull to retry."
									: "Could not save changes. Try again."}
							</Text>
						</View>
					) : null}

					<Text style={styles.sectionLabel}>STUDENTS</Text>

					{!loaded ? (
						<View style={styles.loading}>
							<ActivityIndicator color={Colors.brand.base} />
							<Text style={styles.loadingText}>Opening today’s attendance…</Text>
						</View>
					) : (
						<View style={styles.roster}>
							{(students.data?.students ?? []).map((row, index) => {
								const status = marks[row.student.id] ?? "unknown";
								const expanded = expandedStudentId === row.student.id;
								const avatar =
									resolveMediaUrl(row.student.photoUrl) ??
									`https://avatar.vercel.sh/${encodeURIComponent(row.student.studentCode)}`;
								return (
									<View key={row.student.id}>
										<Pressable
											style={({ pressed }) => [
												styles.studentRow,
												index > 0 && styles.studentDivider,
												pressed && styles.pressedRow,
											]}
											onPress={() => setExpandedStudentId(expanded ? null : row.student.id)}
										>
											<Image source={{ uri: avatar }} style={styles.avatar} />
											<View style={styles.studentCopy}>
												<Text style={styles.studentName}>{row.student.fullName}</Text>
												<Text style={styles.studentMeta}>
													{row.enrollment.rollNumber ? `Roll ${row.enrollment.rollNumber} · ` : ""}
													{row.student.studentCode}
												</Text>
											</View>
											<StatusChip status={status} />
										</Pressable>
										{expanded ? (
											<View
												style={[styles.statusOptions, index > 0 && styles.statusOptionsDivider]}
											>
												{STATUS_OPTIONS.map((option) => {
													const selected = marks[row.student.id] === option;
													return (
														<Pressable
															key={option}
															style={({ pressed }) => [
																styles.optionChip,
																selected && {
																	backgroundColor: attendanceStatusColor(option),
																	borderColor: attendanceStatusColor(option),
																},
																pressed && styles.pressedRow,
															]}
															onPress={() => {
																setStatus(row.student.id, option);
																setExpandedStudentId(null);
															}}
														>
															<Text
																style={[styles.optionText, selected && styles.optionTextSelected]}
															>
																{attendanceStatusLabel(option)}
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
					)}
				</ScrollView>
			</SafeAreaView>

			<View style={styles.saveBar}>
				<Button
					label="Save attendance"
					icon={ClipboardCheck}
					size="lg"
					loading={markAttendance.isPending}
					disabled={!loaded || !getOrCreate.data?.session.id}
					onPress={handleSave}
					style={styles.saveButton}
				/>
			</View>
		</View>
	);
}

function StatusChip({ status }: { status: AttendanceMarkStatus }) {
	const color = attendanceStatusColor(status);
	const bg = attendanceStatusBackground(status);
	return (
		<View style={[styles.statusChip, { backgroundColor: bg }]}>
			<View style={[styles.statusDot, { backgroundColor: color }]} />
			<Text style={[styles.statusChipText, { color }]}>
				{status === "unknown" ? "Not marked" : attendanceStatusLabel(status)}
			</Text>
		</View>
	);
}

function formatShort(value: string): string {
	return new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
	});
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.canvas },
	safeArea: { flex: 1 },
	content: { paddingBottom: 110 },
	datePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		backgroundColor: Colors.brand.tint,
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	dateText: { color: Colors.brand.base, fontSize: 12, fontWeight: "700" },
	summaryCard: {
		marginHorizontal: 16,
		marginTop: 8,
		backgroundColor: Colors.surface,
		borderRadius: 18,
		borderWidth: 1,
		borderColor: Colors.border.base,
		padding: 16,
		...Elevation.raised,
	},
	summaryHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	summaryCopy: { gap: 2 },
	summaryTitle: { ...Type.heading, fontSize: Tokens.fontSize.xl },
	summaryMeta: Type.caption,
	progressText: { ...Type.metricSm, fontSize: Tokens.fontSize["3xl"] },
	legend: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginTop: 14,
		paddingTop: 12,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.base,
	},
	legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
	legendDot: { width: 8, height: 8, borderRadius: 4 },
	legendLabel: { color: Colors.text.secondary, fontSize: 12, textTransform: "capitalize" },
	legendValue: { color: Colors.text.primary, fontSize: 12, fontWeight: "700" },
	allPresent: { marginHorizontal: 16, marginTop: 12 },
	errorRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginHorizontal: 16,
		marginTop: 10,
	},
	errorText: { color: Colors.status.absent.solid, fontSize: 12, flex: 1 },
	sectionLabel: {
		color: Colors.text.muted,
		fontSize: 11,
		fontWeight: "800",
		letterSpacing: 0,
		marginHorizontal: 16,
		marginTop: 20,
		marginBottom: 8,
	},
	loading: { alignItems: "center", gap: 10, paddingVertical: 40 },
	loadingText: Type.caption,
	roster: {
		marginHorizontal: 16,
		backgroundColor: Colors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: Colors.border.base,
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
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.base,
	},
	pressedRow: { opacity: 0.7 },
	avatar: {
		width: 40,
		height: 40,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.sunken,
	},
	studentCopy: { flex: 1, gap: 2 },
	studentName: { color: Colors.text.primary, fontSize: 15, fontWeight: "600" },
	studentMeta: { color: Colors.text.secondary, fontSize: 12 },
	statusChip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 999,
	},
	statusDot: { width: 6, height: 6, borderRadius: 3 },
	statusChipText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
	statusOptions: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 14,
		paddingBottom: 12,
		paddingTop: 2,
	},
	statusOptionsDivider: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.base,
	},
	optionChip: {
		flex: 1,
		alignItems: "center",
		paddingVertical: 8,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: Colors.border.base,
		backgroundColor: Colors.canvas,
	},
	optionText: {
		color: Colors.text.secondary,
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	optionTextSelected: { color: Colors.text.inverse, fontWeight: "700" },
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
