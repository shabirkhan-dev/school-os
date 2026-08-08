import {
	CalendarDays,
	CheckCircle2,
	LogOut,
	Mail,
	ShieldOff,
	UserRound,
} from "lucide-react-native";
import { useEffect } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/card";
import { IconTile, type TileTone } from "@/components/ui/icon-tile";
import { OSHeader } from "@/components/ui/os-header";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";
import { formatRoleLabel } from "@/lib/format-role";
import { resolveMediaUrl } from "@/lib/media-url";
import { useAuth } from "@/modules/auth";
import { AccountTabs } from "@/modules/auth/components/account-tabs";
import { AuthButton } from "@/modules/auth/components/auth-button";
import { ProfileForm } from "./profile-form";

export function ProfileScreen() {
	const { user, tenantContext, logout, logoutAll, refreshUser } = useAuth();

	useEffect(() => {
		void refreshUser();
	}, [refreshUser]);

	if (!user) return null;

	const displayName = user.profile?.displayName?.trim() || user.username;
	const avatarUri =
		resolveMediaUrl(user.profile?.avatarUrl?.trim()) ||
		`https://avatar.vercel.sh/${encodeURIComponent(user.username)}`;
	const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const roleLabel = formatRoleLabel(tenantContext?.role);

	const confirmLogout = () => {
		Alert.alert("Sign out", "End this session on this device?", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Sign out",
				style: "destructive",
				onPress: () => {
					void logout();
				},
			},
		]);
	};

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

	return (
		<View style={styles.screen}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<OSHeader />
				<ScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
				>
					<View style={styles.content}>
						<View style={styles.pageHeader}>
							<Text style={styles.pageTitle}>Profile</Text>
							<Text style={styles.pageSubtitle}>
								Your School OS identity, preferences, and account details.
							</Text>
						</View>

						<AccountTabs active="profile" />

						<View style={styles.heroCard}>
							<View style={styles.heroTop}>
								<View style={styles.avatarWrap}>
									<Image source={{ uri: avatarUri }} style={styles.avatar} />
									<View style={styles.presence} />
								</View>
								<View style={styles.heroCopy}>
									<Text style={styles.roleLabel}>{roleLabel} workspace</Text>
									<Text style={styles.displayName} numberOfLines={2}>
										{displayName}
									</Text>
									<Text style={styles.handle}>@{user.username}</Text>
								</View>
							</View>

							{user.profile?.bio ? <Text style={styles.bio}>{user.profile.bio}</Text> : null}

							<View style={styles.heroStatusRow}>
								<HeroStatus
									icon={CheckCircle2}
									label="Email"
									value={user.emailVerified ? "Verified" : "Action needed"}
									active={user.emailVerified}
								/>
								<View style={styles.heroDivider} />
								<HeroStatus
									icon={UserRound}
									label="Account"
									value={user.isActive ? "Active" : "Inactive"}
									active={user.isActive}
								/>
							</View>
						</View>

						<View style={styles.section}>
							<SectionLabel title="Your details" description="Shown across School OS." />
							<Card depth="lifted">
								<ProfileForm user={user} />
							</Card>
						</View>

						<View style={styles.section}>
							<SectionLabel title="Account identity" description="Read-only sign-in details." />
							<Card depth="raised" style={styles.identityCard}>
								<IdentityRow icon={Mail} tone="blue" label="Email" value={user.email} />
								<IdentityRow
									icon={CheckCircle2}
									tone={user.emailVerified ? "green" : "amber"}
									label="Email status"
									value={user.emailVerified ? "Verified" : "Verification required"}
								/>
								<IdentityRow
									icon={CalendarDays}
									tone="purple"
									label="Member since"
									value={memberSince}
									last
								/>
							</Card>
						</View>

						<View style={styles.section}>
							<SectionLabel title="Session" description="Control access to your account." />
							<Card depth="raised">
								<View style={styles.sessionActions}>
									<AuthButton
										label="Sign out on this device"
										variant="outline"
										onPress={confirmLogout}
									/>
									<PressableScale
										style={styles.logoutAll}
										onPress={confirmLogoutAll}
										scaleTo={0.975}
										dim={false}
										accessibilityRole="button"
										accessibilityLabel="Sign out everywhere"
									>
										<ShieldOff size={17} color={Colors.status.absent.fg} strokeWidth={2} />
										<Text style={styles.logoutAllText}>Sign out everywhere</Text>
									</PressableScale>
									<View style={styles.logoutHint}>
										<LogOut size={14} color={Colors.text.tertiary} strokeWidth={1.8} />
										<Text style={styles.logoutHintText}>
											Signing out here keeps your other trusted devices connected.
										</Text>
									</View>
								</View>
							</Card>
						</View>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

function HeroStatus({
	icon: Icon,
	label,
	value,
	active,
}: {
	icon: typeof CheckCircle2;
	label: string;
	value: string;
	active: boolean;
}) {
	return (
		<View style={styles.heroStatus}>
			<View style={[styles.heroStatusIcon, active && styles.heroStatusIconActive]}>
				<Icon
					size={15}
					color={active ? Colors.status.present.bg : Colors.status.late.bg}
					strokeWidth={2.2}
				/>
			</View>
			<View style={styles.heroStatusCopy}>
				<Text style={styles.heroStatusLabel}>{label}</Text>
				<Text style={styles.heroStatusValue}>{value}</Text>
			</View>
		</View>
	);
}

function SectionLabel({ title, description }: { title: string; description: string }) {
	return (
		<View style={styles.sectionHeading}>
			<Text style={styles.sectionTitle}>{title}</Text>
			<Text style={styles.sectionDescription}>{description}</Text>
		</View>
	);
}

function IdentityRow({
	icon,
	tone,
	label,
	value,
	last = false,
}: {
	icon: typeof Mail;
	tone: TileTone;
	label: string;
	value: string;
	last?: boolean;
}) {
	return (
		<View style={[styles.identityRow, last && styles.identityRowLast]}>
			<IconTile icon={icon} tone={tone} size="sm" />
			<View style={styles.identityCopy}>
				<Text style={styles.identityLabel}>{label}</Text>
				<Text style={styles.identityValue} numberOfLines={2}>
					{value}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: Colors.canvas },
	safeArea: { flex: 1 },
	scrollContent: { paddingBottom: Tokens.space["12"] },
	content: {
		paddingHorizontal: Tokens.space["5"],
		paddingTop: Tokens.space["5"],
		gap: Tokens.space["6"],
	},
	pageHeader: { gap: Tokens.space["1"] },
	pageTitle: Type.display,
	pageSubtitle: { ...Type.meta, color: Colors.text.tertiary, maxWidth: 340 },

	heroCard: {
		backgroundColor: Colors.ink.base,
		borderRadius: Tokens.radius["2xl"],
		padding: Tokens.space["5"],
		...Elevation.floating,
	},
	heroTop: { flexDirection: "row", alignItems: "center", gap: Tokens.space["4"] },
	avatarWrap: { position: "relative" },
	avatar: {
		width: 80,
		height: 80,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.ink.hover,
		borderWidth: 3,
		borderColor: "rgba(255,255,255,0.16)",
	},
	presence: {
		position: "absolute",
		right: 2,
		bottom: 2,
		width: 18,
		height: 18,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.status.present.solid,
		borderWidth: 3,
		borderColor: Colors.ink.base,
	},
	heroCopy: { flex: 1, gap: Tokens.space["0.5"] },
	roleLabel: {
		fontSize: Tokens.fontSize.xs,
		fontWeight: Tokens.fontWeight.bold,
		color: "rgba(255,255,255,0.58)",
		textTransform: "uppercase",
	},
	displayName: {
		fontSize: Tokens.fontSize["4xl"],
		fontWeight: Tokens.fontWeight.bold,
		lineHeight: Tokens.fontSize["4xl"] * Tokens.leading.tight,
		color: Colors.text.inverse,
	},
	handle: {
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.medium,
		color: "rgba(255,255,255,0.62)",
	},
	bio: {
		fontSize: Tokens.fontSize.md,
		lineHeight: Tokens.fontSize.md * Tokens.leading.normal,
		color: "rgba(255,255,255,0.72)",
		marginTop: Tokens.space["4"],
	},
	heroStatusRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: Tokens.space["5"],
		paddingTop: Tokens.space["4"],
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "rgba(255,255,255,0.14)",
	},
	heroStatus: { flex: 1, flexDirection: "row", alignItems: "center", gap: Tokens.space["2"] },
	heroStatusIcon: {
		width: 30,
		height: 30,
		borderRadius: Tokens.radius.sm,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(217,119,6,0.22)",
	},
	heroStatusIconActive: { backgroundColor: "rgba(22,163,74,0.22)" },
	heroStatusCopy: { flex: 1, gap: 1 },
	heroStatusLabel: { fontSize: Tokens.fontSize.xs, color: "rgba(255,255,255,0.48)" },
	heroStatusValue: {
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.semibold,
		color: Colors.text.inverse,
	},
	heroDivider: {
		width: StyleSheet.hairlineWidth,
		height: 32,
		backgroundColor: "rgba(255,255,255,0.14)",
		marginHorizontal: Tokens.space["3"],
	},

	section: { gap: Tokens.space["3"] },
	sectionHeading: { gap: Tokens.space["0.5"], paddingHorizontal: Tokens.space["1"] },
	sectionTitle: Type.heading,
	sectionDescription: Type.caption,

	identityCard: { paddingVertical: Tokens.space["2"], paddingHorizontal: Tokens.space["4"] },
	identityRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		paddingVertical: Tokens.space["3"],
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border.subtle,
	},
	identityRowLast: { borderBottomWidth: 0 },
	identityCopy: { flex: 1, gap: Tokens.space["0.5"] },
	identityLabel: { ...Type.caption, color: Colors.text.tertiary },
	identityValue: {
		...Type.meta,
		color: Colors.text.primary,
		fontWeight: Tokens.fontWeight.semibold,
	},

	sessionActions: { gap: Tokens.space["3"] },
	logoutAll: {
		minHeight: 52,
		borderRadius: Tokens.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.status.absent.border,
		backgroundColor: Colors.status.absent.bg,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Tokens.space["2"],
	},
	logoutAllText: {
		fontSize: Tokens.fontSize.lg,
		fontWeight: Tokens.fontWeight.bold,
		color: Colors.status.absent.fg,
	},
	logoutHint: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "center",
		gap: Tokens.space["1.5"],
		paddingHorizontal: Tokens.space["2"],
	},
	logoutHintText: { ...Type.caption, flex: 1, textAlign: "center" },
});
