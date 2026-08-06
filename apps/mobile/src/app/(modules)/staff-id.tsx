import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors, AppShadows } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import { useTeacherProfileQuery } from "@/modules/teacher";
import { ScreenHeader } from "@/modules/teacher/components/screen-header";

export default function StaffIdScreen() {
	const { tenantContext, user } = useAuth();
	const tenantId = tenantContext?.tenantId ?? null;
	const profile = useTeacherProfileQuery(tenantId);

	const teacher = profile.data?.teacher;
	const displayName = user?.profile?.displayName || user?.username || "Teacher";
	const email = teacher?.email || user?.email || "";
	const employeeCode = teacher?.profile?.employeeCode ?? null;
	const phone = teacher?.profile?.phone ?? null;
	const specialization = teacher?.profile?.specialization ?? null;
	const qualification = teacher?.profile?.qualification ?? null;
	const roleLabel = formatRole(tenantContext?.role);
	const teacherStatus = teacher?.status ?? "active";
	const statusActive = teacherStatus === "active";
	const statusLabel = teacherStatus.replace("_", " ");

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<ScreenHeader title="Staff ID" subtitle="Official teaching identity" />
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
					{profile.isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={AppColors.primary.brand} size="large" />
						</View>
					) : (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={styles.cardHeaderCopy}>
									<Text style={styles.cardEyebrow}>STAFF ID</Text>
									<Text style={styles.schoolName}>School OS</Text>
								</View>
								<View style={styles.monogram}>
									<Text style={styles.monogramText}>SO</Text>
								</View>
							</View>

							<View style={styles.cardBody}>
								<View style={styles.identityRow}>
									<Image
										source={{
											uri:
												user?.profile?.avatarUrl?.trim() ||
												`https://avatar.vercel.sh/${encodeURIComponent(user?.username ?? "teacher")}`,
										}}
										style={styles.avatar}
									/>
									<View style={styles.identityCopy}>
										<Text style={styles.name}>{displayName}</Text>
										<Text style={styles.email}>{email}</Text>
										<Text style={styles.employeeCode}>{employeeCode ?? "No employee code"}</Text>
									</View>
								</View>

								<View style={styles.badges}>
									<View style={styles.roleBadge}>
										<Text style={styles.roleBadgeText}>{roleLabel}</Text>
									</View>
									<View
										style={[styles.statusBadge, statusActive ? null : styles.statusBadgeInactive]}
									>
										<View
											style={[styles.statusDot, statusActive ? null : styles.statusDotInactive]}
										/>
										<Text
											style={[
												styles.statusBadgeText,
												statusActive ? null : styles.statusBadgeTextInactive,
											]}
										>
											{statusLabel}
										</Text>
									</View>
								</View>

								{specialization ? (
									<Text style={styles.detailText}>
										<Text style={styles.detailLabel}>Specialization: </Text>
										{specialization}
									</Text>
								) : null}
								{qualification ? (
									<Text style={styles.detailText}>
										<Text style={styles.detailLabel}>Qualification: </Text>
										{qualification}
									</Text>
								) : null}

								<View style={styles.footer}>
									<View style={styles.footerStat}>
										<Text style={styles.footerValue}>{teacher?.homeroomSectionCount ?? 0}</Text>
										<Text style={styles.footerLabel}>Homerooms</Text>
									</View>
									<View style={styles.footerDivider} />
									<View style={styles.footerStat}>
										<Text style={styles.footerValue}>{teacher?.subjectAssignmentCount ?? 0}</Text>
										<Text style={styles.footerLabel}>Subjects</Text>
									</View>
									<View style={styles.footerDivider} />
									<View style={styles.footerStat}>
										<Text style={styles.footerValue}>{phone ?? "—"}</Text>
										<Text style={styles.footerLabel}>Phone</Text>
									</View>
								</View>
							</View>
						</View>
					)}

					<Text style={styles.note}>
						Present this card to the front office for verification. Your code is{" "}
						{employeeCode ?? "unassigned"}.
					</Text>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function formatRole(role?: string): string {
	if (!role) return "Staff";
	return role
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	content: { padding: 20, paddingBottom: 48 },
	loading: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
	card: {
		backgroundColor: AppColors.surface,
		borderRadius: 22,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		overflow: "hidden",
		...AppShadows.md,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: AppColors.primary.main,
		paddingHorizontal: 18,
		paddingVertical: 14,
	},
	cardHeaderCopy: { gap: 1 },
	monogram: {
		width: 38,
		height: 38,
		borderRadius: 11,
		backgroundColor: "rgba(255,255,255,0.14)",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.22)",
	},
	monogramText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
	cardEyebrow: {
		color: "rgba(255,255,255,0.7)",
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 1.6,
	},
	schoolName: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
	cardBody: { padding: 18 },
	identityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
	avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: AppColors.card.subtle },
	identityCopy: { flex: 1, gap: 2 },
	name: { color: AppColors.text.primary, fontSize: 19, fontWeight: "800", letterSpacing: -0.3 },
	email: { color: AppColors.text.secondary, fontSize: 13 },
	employeeCode: {
		color: AppColors.text.muted,
		fontSize: 12,
		fontFamily: "monospace",
		marginTop: 2,
	},
	badges: { flexDirection: "row", gap: 8, marginTop: 14 },
	roleBadge: {
		backgroundColor: AppColors.primary.subtle,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#DBEAFE",
	},
	roleBadgeText: {
		color: AppColors.primary.brand,
		fontSize: 12,
		fontWeight: "700",
		textTransform: "capitalize",
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: AppColors.status.presentBg,
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 999,
	},
	statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: AppColors.status.present },
	statusDotInactive: { backgroundColor: AppColors.status.pending },
	statusBadgeText: {
		color: AppColors.status.present,
		fontSize: 12,
		fontWeight: "700",
		textTransform: "capitalize",
	},
	statusBadgeInactive: { backgroundColor: AppColors.status.pendingBg },
	statusBadgeTextInactive: { color: AppColors.status.pending },
	detailText: { color: AppColors.text.secondary, fontSize: 13, lineHeight: 20, marginTop: 12 },
	detailLabel: { color: AppColors.text.primary, fontWeight: "700" },
	footer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 18,
		paddingTop: 14,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	footerStat: { flex: 1, alignItems: "center", gap: 2 },
	footerValue: { color: AppColors.text.primary, fontSize: 14, fontWeight: "800" },
	footerLabel: {
		color: AppColors.text.muted,
		fontSize: 10,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.4,
	},
	footerDivider: { width: 1, height: 28, backgroundColor: AppColors.card.border },
	note: {
		color: AppColors.text.muted,
		fontSize: 12,
		lineHeight: 18,
		textAlign: "center",
		marginTop: 18,
		paddingHorizontal: 24,
	},
});
