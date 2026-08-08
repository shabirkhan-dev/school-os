import {
	CheckCircle2,
	Fingerprint,
	KeyRound,
	Lock,
	Monitor,
	Shield,
	ShieldOff,
	Smartphone,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/card";
import { OSHeader } from "@/components/ui/os-header";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";
import { AccountTabs } from "@/modules/auth/components/account-tabs";
import { AuthAlert } from "@/modules/auth/components/auth-alert";
import { AuthButton } from "@/modules/auth/components/auth-button";
import { AuthField } from "@/modules/auth/components/auth-field";
import {
	useBeginTotpSetupMutation,
	useChangePasswordMutation,
	useConfirmTotpSetupMutation,
	useDeletePasskeyMutation,
	useDisableTotpMutation,
	useRegisterPasskeyMutation,
	useRevokeSessionMutation,
} from "@/modules/auth/hooks/use-auth-mutations";
import { useSecurityStatusQuery, useSessionsQuery } from "@/modules/auth/hooks/use-auth-queries";

export function SecurityScreen() {
	const { user, logout, logoutAll } = useAuth();
	const sessions = useSessionsQuery();
	const security = useSecurityStatusQuery();
	const changePassword = useChangePasswordMutation();
	const revoke = useRevokeSessionMutation();
	const beginTotp = useBeginTotpSetupMutation();
	const confirmTotp = useConfirmTotpSetupMutation();
	const disableTotp = useDisableTotpMutation();
	const registerPasskey = useRegisterPasskeyMutation();
	const deletePasskey = useDeletePasskeyMutation();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [totpCode, setTotpCode] = useState("");
	const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
	const [passkeyName, setPasskeyName] = useState("This device");
	const [passwordSaved, setPasswordSaved] = useState(false);

	if (!user) return null;

	const error = [
		sessions.error,
		security.error,
		changePassword.error,
		revoke.error,
		beginTotp.error,
		confirmTotp.error,
		disableTotp.error,
		registerPasskey.error,
		deletePasskey.error,
	].find((value) => value instanceof Error);

	const passkeys = security.data?.passkeys ?? [];
	const totpEnabled = security.data?.mfa.totpEnabled ?? false;
	const googleLinked = security.data?.social.googleLinked ?? false;
	const protectionCount = [
		user.emailVerified,
		user.hasPassword,
		totpEnabled,
		passkeys.length > 0,
	].filter(Boolean).length;

	const confirmLogoutAll = () => {
		Alert.alert("Sign out everywhere", "Revoke all active sessions for this account?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Sign out everywhere",
				style: "destructive",
				onPress: () => {
					void logoutAll();
				},
			},
		]);
	};

	const confirmRevoke = (sessionId: string, isCurrent: boolean) => {
		Alert.alert(
			isCurrent ? "Revoke this device?" : "Revoke session?",
			isCurrent
				? "You will be signed out on this device."
				: "That device will need to sign in again.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Revoke",
					style: "destructive",
					onPress: () => {
						revoke.mutate(sessionId, {
							onSuccess: async () => {
								if (isCurrent) await logout();
							},
						});
					},
				},
			],
		);
	};

	const confirmDeletePasskey = (passkeyId: string, name: string) => {
		Alert.alert("Remove passkey", `Remove “${name}”?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Remove",
				style: "destructive",
				onPress: () => deletePasskey.mutate(passkeyId),
			},
		]);
	};

	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<OSHeader />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.viewContainer}>
						<View style={styles.viewHeader}>
							<Text style={styles.viewTitle}>Security</Text>
							<Text style={styles.viewSubtitle}>
								Protect your School OS account, recovery options, and trusted devices.
							</Text>
						</View>

						<AccountTabs active="security" />

						{error ? (
							<AuthAlert
								variant="destructive"
								title="Something went wrong"
								message={error.message}
							/>
						) : null}

						<View style={styles.protectionCard}>
							<View style={styles.protectionTop}>
								<View style={styles.protectionCopy}>
									<Text style={styles.protectionEyebrow}>Security posture</Text>
									<Text style={styles.protectionScore}>{protectionCount} of 4 active</Text>
								</View>
								<View style={styles.protectionIcon}>
									<Shield size={24} color={Colors.ink.foreground} strokeWidth={2} />
								</View>
							</View>
							<View style={styles.protectionTrack}>
								<View
									style={[
										styles.protectionFill,
										{ width: `${protectionCount * 25}%` as `${number}%` },
									]}
								/>
							</View>
							<Text style={styles.protectionHint}>
								{protectionCount === 4
									? "Every recommended account protection is active."
									: `${4 - protectionCount} recommended protection${4 - protectionCount === 1 ? "" : "s"} remaining.`}
								{googleLinked ? " Google sign-in is linked." : ""}
							</Text>
						</View>

						<View style={styles.overviewGrid}>
							<OverviewChip
								label="Email"
								value={user.emailVerified ? "Verified" : "Needs verification"}
								active={user.emailVerified}
							/>
							<OverviewChip
								label="Password"
								value={user.hasPassword ? "Configured" : "Not configured"}
								active={user.hasPassword}
							/>
							<OverviewChip
								label="Two-factor"
								value={totpEnabled ? "Enabled" : "Not enabled"}
								active={totpEnabled}
							/>
							<OverviewChip
								label="Passkeys"
								value={passkeys.length === 1 ? "1 registered" : `${passkeys.length} registered`}
								active={passkeys.length > 0}
							/>
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionLabel}>TWO-FACTOR AUTHENTICATION</Text>
							<Card depth="raised">
								<View style={styles.sectionBody}>
									<Text style={styles.sectionHelp}>
										Require an authenticator code after password sign-in.
									</Text>
									{security.isLoading ? (
										<ActivityIndicator color={Colors.brand.base} />
									) : totpEnabled ? (
										<>
											<View style={styles.statusRow}>
												<CheckCircle2 size={16} color={Colors.status.present.fg} strokeWidth={2} />
												<Text style={styles.statusText}>
													Authenticator active · {security.data?.mfa.recoveryCodesRemaining ?? 0}{" "}
													recovery codes left
												</Text>
											</View>
											<AuthField
												label="Authenticator or recovery code"
												value={totpCode}
												onChangeText={setTotpCode}
												placeholder="123456"
												keyboardType="number-pad"
												autoComplete="one-time-code"
												maxLength={32}
											/>
											<AuthButton
												label={disableTotp.isPending ? "Disabling…" : "Disable 2FA"}
												variant="outline"
												pending={disableTotp.isPending}
												disabled={!totpCode.trim()}
												onPress={() => {
													disableTotp.mutate(totpCode, {
														onSuccess: () => setTotpCode(""),
													});
												}}
											/>
										</>
									) : beginTotp.data ? (
										<>
											<Image source={{ uri: beginTotp.data.qrCodeDataUrl }} style={styles.qr} />
											<Text style={styles.sectionHelp}>
												Scan the QR code, then enter the six-digit code from your authenticator.
											</Text>
											<Text style={styles.secret} selectable>
												{beginTotp.data.secret}
											</Text>
											<AuthField
												label="Six-digit code"
												value={totpCode}
												onChangeText={setTotpCode}
												placeholder="123456"
												keyboardType="number-pad"
												autoComplete="one-time-code"
												maxLength={6}
											/>
											<AuthButton
												label={confirmTotp.isPending ? "Confirming…" : "Confirm 2FA"}
												pending={confirmTotp.isPending}
												disabled={totpCode.trim().length !== 6}
												onPress={() => {
													confirmTotp.mutate(totpCode, {
														onSuccess: (result) => {
															setRecoveryCodes(result.recoveryCodes);
															setTotpCode("");
														},
													});
												}}
											/>
										</>
									) : (
										<AuthButton
											label={beginTotp.isPending ? "Starting…" : "Set up authenticator"}
											pending={beginTotp.isPending}
											onPress={() => beginTotp.mutate()}
										/>
									)}
									{recoveryCodes.length > 0 ? (
										<View style={styles.recoveryBox}>
											<Text style={styles.recoveryTitle}>Save these recovery codes now</Text>
											{recoveryCodes.map((code) => (
												<Text key={code} style={styles.recoveryCode} selectable>
													{code}
												</Text>
											))}
										</View>
									) : null}
								</View>
							</Card>
						</View>

						<View style={styles.section}>
							<Text style={styles.sectionLabel}>PASSKEYS</Text>
							<Card depth="raised">
								<View style={styles.sectionBody}>
									<Text style={styles.sectionHelp}>
										Use biometrics, a device PIN, or a physical security key. Requires a development
										build (not Expo Go).
									</Text>
									{passkeys.length === 0 ? (
										<Text style={styles.empty}>No passkeys registered</Text>
									) : (
										passkeys.map((passkey) => (
											<View key={passkey.id} style={styles.listRow}>
												<View style={styles.listIcon}>
													<KeyRound size={16} color={Colors.text.secondary} strokeWidth={1.8} />
												</View>
												<View style={styles.listCopy}>
													<Text style={styles.listTitle}>{passkey.name}</Text>
													<Text style={styles.listMeta}>
														{passkey.deviceType}
														{passkey.backedUp ? " · synced" : ""}
													</Text>
												</View>
												<PressableScale
													onPress={() => confirmDeletePasskey(passkey.id, passkey.name)}
													hitSlop={8}
													scaleTo={0.94}
													accessibilityRole="button"
													accessibilityLabel={`Remove ${passkey.name}`}
												>
													<Text style={styles.dangerLink}>Remove</Text>
												</PressableScale>
											</View>
										))
									)}
									<AuthField
										label="Device name"
										value={passkeyName}
										onChangeText={setPasskeyName}
										placeholder="This device"
										maxLength={64}
									/>
									<AuthButton
										label={registerPasskey.isPending ? "Adding…" : "Add passkey"}
										pending={registerPasskey.isPending}
										disabled={!passkeyName.trim()}
										onPress={() => registerPasskey.mutate(passkeyName.trim())}
									/>
								</View>
							</Card>
						</View>

						{user.hasPassword ? (
							<View style={styles.section}>
								<Text style={styles.sectionLabel}>CHANGE PASSWORD</Text>
								<Card depth="raised">
									<View style={styles.sectionBody}>
										<Text style={styles.sectionHelp}>
											Changing it signs out every other active session.
										</Text>
										{passwordSaved && changePassword.isSuccess ? (
											<AuthAlert
												title="Password updated"
												message="Use your new password next time."
											/>
										) : null}
										<AuthField
											label="Current password"
											value={currentPassword}
											onChangeText={setCurrentPassword}
											secureTextEntry={!showCurrent}
											showPasswordToggle
											onTogglePassword={() => setShowCurrent((v) => !v)}
											autoComplete="password"
										/>
										<AuthField
											label="New password"
											value={newPassword}
											onChangeText={setNewPassword}
											secureTextEntry={!showNew}
											showPasswordToggle
											onTogglePassword={() => setShowNew((v) => !v)}
											autoComplete="new-password"
											hint="Use at least 12 characters."
										/>
										<AuthButton
											label={changePassword.isPending ? "Updating…" : "Change password"}
											pending={changePassword.isPending}
											disabled={currentPassword.length === 0 || newPassword.length < 12}
											onPress={() => {
												setPasswordSaved(true);
												changePassword.mutate(
													{ currentPassword, newPassword },
													{
														onSuccess: () => {
															setCurrentPassword("");
															setNewPassword("");
														},
													},
												);
											}}
										/>
									</View>
								</Card>
							</View>
						) : null}

						<View style={styles.section}>
							<Text style={styles.sectionLabel}>ACTIVE SESSIONS</Text>
							<Card depth="raised">
								<View style={styles.sectionBody}>
									{sessions.isLoading ? (
										<ActivityIndicator color={Colors.brand.base} />
									) : sessions.data?.length ? (
										sessions.data.map((session) => (
											<View key={session.id} style={styles.listRow}>
												<View style={styles.listIcon}>
													<Monitor size={16} color={Colors.text.secondary} strokeWidth={1.8} />
												</View>
												<View style={styles.listCopy}>
													<Text style={styles.listTitle} numberOfLines={2}>
														{session.userAgent ?? "Unknown device"}
													</Text>
													<Text style={styles.listMeta}>
														{session.ipAddress ?? "Unknown IP"} ·{" "}
														{new Date(session.lastUsedAt).toLocaleString()}
														{session.isCurrent ? " · Current" : ""}
													</Text>
												</View>
												<PressableScale
													onPress={() => confirmRevoke(session.id, session.isCurrent)}
													hitSlop={8}
													scaleTo={0.94}
													accessibilityRole="button"
													accessibilityLabel={`Revoke ${session.isCurrent ? "current device" : "session"}`}
												>
													<Text style={styles.dangerLink}>Revoke</Text>
												</PressableScale>
											</View>
										))
									) : (
										<Text style={styles.empty}>No active sessions found.</Text>
									)}
									<PressableScale
										style={styles.logoutAll}
										onPress={confirmLogoutAll}
										scaleTo={0.975}
										dim={false}
										accessibilityRole="button"
										accessibilityLabel="Sign out everywhere"
									>
										<ShieldOff size={16} color={Colors.status.absent.fg} strokeWidth={1.8} />
										<Text style={styles.logoutAllText}>Sign out everywhere</Text>
									</PressableScale>
								</View>
							</Card>
						</View>

						<View style={styles.footerHint}>
							<Smartphone size={14} color={Colors.text.tertiary} strokeWidth={1.8} />
							<Text style={styles.footerHintText}>
								Google account linking is available on the web account settings for now.
							</Text>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function OverviewChip({ label, value, active }: { label: string; value: string; active: boolean }) {
	return (
		<View style={styles.chip}>
			<View style={styles.chipIcon}>
				{label === "Two-factor" ? (
					<Shield size={14} color={Colors.text.secondary} strokeWidth={1.8} />
				) : label === "Passkeys" ? (
					<Fingerprint size={14} color={Colors.text.secondary} strokeWidth={1.8} />
				) : (
					<Lock size={14} color={Colors.text.secondary} strokeWidth={1.8} />
				)}
			</View>
			<Text style={styles.chipLabel}>{label}</Text>
			<View style={styles.chipValueRow}>
				<View style={[styles.dot, active ? styles.dotActive : styles.dotInactive]} />
				<Text style={styles.chipValue} numberOfLines={1}>
					{value}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: Colors.canvas },
	safeArea: { flex: 1 },
	scrollContent: { paddingBottom: Tokens.space["12"] },
	viewContainer: {
		paddingHorizontal: Tokens.space["5"],
		paddingTop: Tokens.space["5"],
		gap: Tokens.space["6"],
	},
	viewHeader: { gap: Tokens.space["1"] },
	viewTitle: Type.display,
	viewSubtitle: { ...Type.meta, color: Colors.text.tertiary, maxWidth: 350 },

	protectionCard: {
		borderRadius: Tokens.radius["2xl"],
		backgroundColor: Colors.ink.base,
		padding: Tokens.space["5"],
		gap: Tokens.space["4"],
		...Elevation.floating,
	},
	protectionTop: { flexDirection: "row", alignItems: "center", gap: Tokens.space["4"] },
	protectionCopy: { flex: 1, gap: Tokens.space["1"] },
	protectionEyebrow: {
		fontSize: Tokens.fontSize.xs,
		fontWeight: Tokens.fontWeight.bold,
		textTransform: "uppercase",
		color: "rgba(255,255,255,0.54)",
	},
	protectionScore: {
		fontSize: Tokens.fontSize["4xl"],
		fontWeight: Tokens.fontWeight.bold,
		color: Colors.text.inverse,
	},
	protectionIcon: {
		width: 52,
		height: 52,
		borderRadius: Tokens.radius.lg,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(255,255,255,0.1)",
	},
	protectionTrack: {
		height: 7,
		borderRadius: Tokens.radius.full,
		backgroundColor: "rgba(255,255,255,0.12)",
		overflow: "hidden",
	},
	protectionFill: {
		height: "100%",
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.status.present.solid,
	},
	protectionHint: {
		fontSize: Tokens.fontSize.sm,
		lineHeight: Tokens.fontSize.sm * Tokens.leading.normal,
		color: "rgba(255,255,255,0.64)",
	},

	overviewGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Tokens.space["2.5"],
	},
	chip: {
		width: "48%",
		flexGrow: 1,
		gap: Tokens.space["2"],
		padding: Tokens.space["3.5"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		...Elevation.raised,
	},
	chipIcon: {
		width: 32,
		height: 32,
		borderRadius: Tokens.radius.sm,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.sunken,
	},
	chipLabel: {
		color: Colors.text.tertiary,
		fontSize: Tokens.fontSize.xs,
		fontWeight: Tokens.fontWeight.semibold,
		textTransform: "uppercase",
	},
	chipValueRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["1.5"],
	},
	dot: {
		width: 6,
		height: 6,
		borderRadius: Tokens.radius.full,
	},
	dotActive: { backgroundColor: Colors.status.present.solid },
	dotInactive: { backgroundColor: Colors.text.muted },
	chipValue: {
		flex: 1,
		color: Colors.text.primary,
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
	},

	section: { gap: Tokens.space["3"] },
	sectionLabel: {
		...Type.overline,
		color: Colors.text.tertiary,
		paddingHorizontal: Tokens.space["1"],
	},
	sectionBody: { gap: Tokens.space["3.5"] },
	sectionHelp: {
		...Type.meta,
		color: Colors.text.secondary,
	},
	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["2"],
		padding: Tokens.space["3"],
		borderRadius: Tokens.radius.md,
		backgroundColor: Colors.status.present.bg,
	},
	statusText: {
		flex: 1,
		color: Colors.status.present.fg,
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
	},
	qr: {
		width: 160,
		height: 160,
		alignSelf: "center",
		borderRadius: Tokens.radius.md,
		backgroundColor: Colors.surfaceBright,
		...Elevation.lifted,
	},
	secret: {
		color: Colors.text.secondary,
		fontSize: Tokens.fontSize.xs,
		fontFamily: "monospace",
		padding: Tokens.space["3"],
		borderRadius: Tokens.radius.sm,
		backgroundColor: Colors.sunken,
	},
	recoveryBox: {
		gap: Tokens.space["1.5"],
		padding: Tokens.space["3"],
		borderRadius: Tokens.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.status.present.border,
		backgroundColor: Colors.status.present.bg,
	},
	recoveryTitle: {
		color: Colors.status.present.fg,
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.bold,
		marginBottom: Tokens.space["1"],
	},
	recoveryCode: {
		color: Colors.text.primary,
		fontSize: Tokens.fontSize.sm,
		fontFamily: "monospace",
	},
	empty: {
		...Type.caption,
		textAlign: "center",
		paddingVertical: Tokens.space["2"],
	},
	listRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["2.5"],
		paddingVertical: Tokens.space["3"],
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border.subtle,
	},
	listIcon: {
		width: 32,
		height: 32,
		borderRadius: Tokens.radius.sm,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.sunken,
	},
	listCopy: { flex: 1, gap: Tokens.space["0.5"] },
	listTitle: {
		color: Colors.text.primary,
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
	},
	listMeta: { ...Type.caption, color: Colors.text.tertiary },
	dangerLink: {
		color: Colors.status.absent.fg,
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
		paddingVertical: Tokens.space["2"],
		paddingHorizontal: Tokens.space["1"],
	},
	logoutAll: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Tokens.space["2"],
		minHeight: 52,
		borderRadius: Tokens.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.status.absent.border,
		backgroundColor: Colors.status.absent.bg,
		marginTop: Tokens.space["1"],
	},
	logoutAllText: {
		color: Colors.status.absent.fg,
		fontSize: Tokens.fontSize.lg,
		fontWeight: Tokens.fontWeight.bold,
	},
	footerHint: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: Tokens.space["2"],
		paddingHorizontal: Tokens.space["1"],
	},
	footerHintText: {
		flex: 1,
		...Type.caption,
		color: Colors.text.tertiary,
	},
});
