import { router } from "expo-router";
import { Bell } from "lucide-react-native";
import { Image, StyleSheet, Text, View } from "react-native";
import { Colors, Tokens, Type } from "@/constants/design-system";
import { formatRoleLabel } from "@/lib/format-role";
import { resolveMediaUrl } from "@/lib/media-url";
import { useAuth } from "@/modules/auth";
import { PressableScale } from "./pressable-scale";

/**
 * Identity bar. Deliberately slim — the screen owns the greeting and page title,
 * so this carries only identity and the notification tap target.
 */
export function OSHeader() {
	const { user, tenantContext } = useAuth();

	const avatarUri =
		resolveMediaUrl(user?.profile?.avatarUrl?.trim()) ||
		(user
			? `https://avatar.vercel.sh/${encodeURIComponent(user.username)}`
			: "https://avatar.vercel.sh/teacher");

	const displayName = user?.profile?.displayName || user?.username || "Teacher";
	const roleLabel = formatRoleLabel(tenantContext?.role);

	return (
		<View style={styles.container}>
			<PressableScale
				style={styles.identity}
				scaleTo={0.97}
				onPress={() => router.replace("/(modules)/(profile)")}
				accessibilityRole="button"
				accessibilityLabel={`${displayName}, ${roleLabel}. Open profile`}
			>
				<View style={styles.avatarWrap}>
					<Image source={{ uri: avatarUri }} style={styles.avatar} />
					<View style={styles.presence} />
				</View>

				<View style={styles.copy}>
					<Text style={styles.name} numberOfLines={1}>
						{displayName}
					</Text>
					<Text style={styles.role} numberOfLines={1}>
						{roleLabel}
					</Text>
				</View>
			</PressableScale>

			<PressableScale
				style={styles.iconButton}
				scaleTo={0.92}
				onPress={() => router.replace("/(modules)/(profile)")}
				accessibilityRole="button"
				accessibilityLabel="Notifications"
			>
				<Bell size={18} color={Colors.text.secondary} strokeWidth={1.9} />
			</PressableScale>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: Tokens.space["5"],
		paddingVertical: Tokens.space["3"],
		backgroundColor: Colors.canvas,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border.subtle,
	},
	identity: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["2.5"],
		flex: 1,
	},
	avatarWrap: { position: "relative" },
	avatar: {
		width: 36,
		height: 36,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.sunken,
	},
	presence: {
		position: "absolute",
		bottom: -1,
		right: -1,
		width: 11,
		height: 11,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.status.present.solid,
		borderWidth: 2.5,
		borderColor: Colors.canvas,
	},
	copy: { flex: 1 },
	name: {
		...Type.subheading,
		fontSize: Tokens.fontSize.md,
	},
	role: {
		...Type.caption,
		marginTop: 1,
	},
	iconButton: {
		width: 36,
		height: 36,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.surface,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
		alignItems: "center",
		justifyContent: "center",
	},
});
