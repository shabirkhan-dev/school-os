import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";
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
							<ActivityIndicator color={Colors.brand.base} size="large" />
						</View>
					) : (
						<View style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={styles.cardHeaderCopy}>
									<Text style={styles.cardEyebrow}>OFFICIAL IDENTITY</Text>
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
	container: { flex: 1, backgroundColor: Colors.canvas },
	safeArea: { flex: 1 },
	content: { padding: Tokens.space["5"], paddingBottom: Tokens.space["12"] },
	loading: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
	card: {
		backgroundColor: Colors.surface,
		borderRadius: Tokens.radius["2xl"],
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
		overflow: "hidden",
		...Elevation.floating,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: Colors.ink.base,
		paddingHorizontal: Tokens.space["5"],
		paddingVertical: Tokens.space["4"],
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
	monogramText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800", letterSpacing: 0 },
	cardEyebrow: {
		color: "rgba(255,255,255,0.7)",
		fontSize: 10,
		fontWeight: "800",
		letterSpacing: 0,
	},
	schoolName: { color: "#FFFFFF", fontSize: 16, fontWeight: "800", letterSpacing: 0 },
	cardBody: { padding: Tokens.space["5"] },
	identityRow: { flexDirection: "row", alignItems: "center", gap: 14 },
	avatar: {
		width: 72,
		height: 72,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.sunken,
	},
	identityCopy: { flex: 1, gap: 2 },
	name: { ...Type.title, fontSize: Tokens.fontSize["3xl"] },
	email: Type.caption,
	employeeCode: {
		color: Colors.text.tertiary,
		fontSize: Tokens.fontSize.sm,
		fontFamily: "monospace",
		marginTop: 2,
	},
	badges: { flexDirection: "row", gap: 8, marginTop: 14 },
	roleBadge: {
		backgroundColor: Colors.brand.tint,
		paddingHorizontal: Tokens.space["3"],
		paddingVertical: Tokens.space["1.5"],
		borderRadius: 999,
		borderWidth: 1,
		borderColor: Colors.brand.border,
	},
	roleBadgeText: {
		color: Colors.brand.base,
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.bold,
		textTransform: "capitalize",
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: Colors.status.present.bg,
		paddingHorizontal: Tokens.space["3"],
		paddingVertical: Tokens.space["1.5"],
		borderRadius: 999,
	},
	statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.status.present.solid },
	statusDotInactive: { backgroundColor: Colors.status.pending.solid },
	statusBadgeText: {
		color: Colors.status.present.fg,
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.bold,
		textTransform: "capitalize",
	},
	statusBadgeInactive: { backgroundColor: Colors.status.pending.bg },
	statusBadgeTextInactive: { color: Colors.status.pending.fg },
	detailText: { ...Type.body, marginTop: Tokens.space["3"] },
	detailLabel: { color: Colors.text.primary, fontWeight: Tokens.fontWeight.bold },
	footer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: Tokens.space["5"],
		paddingTop: Tokens.space["4"],
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border.subtle,
	},
	footerStat: { flex: 1, alignItems: "center", gap: 2 },
	footerValue: {
		color: Colors.text.primary,
		fontSize: Tokens.fontSize.lg,
		fontWeight: Tokens.fontWeight.bold,
	},
	footerLabel: {
		color: Colors.text.tertiary,
		fontSize: Tokens.fontSize["2xs"],
		fontWeight: Tokens.fontWeight.bold,
		textTransform: "uppercase",
		letterSpacing: 0,
	},
	footerDivider: {
		width: StyleSheet.hairlineWidth,
		height: 32,
		backgroundColor: Colors.border.base,
	},
	note: {
		...Type.caption,
		lineHeight: Tokens.fontSize.sm * Tokens.leading.relaxed,
		textAlign: "center",
		marginTop: Tokens.space["5"],
		paddingHorizontal: Tokens.space["6"],
	},
});
