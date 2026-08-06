import { router } from "expo-router";
import { Bell, ShieldCheck } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AppColors, AppShadows } from "@/constants/design-system";
import { resolveMediaUrl } from "@/lib/media-url";
import { useAuth } from "@/modules/auth";

export function OSHeader() {
	const { user, tenantContext } = useAuth();

	const avatarUri =
		resolveMediaUrl(user?.profile?.avatarUrl?.trim()) ||
		(user
			? `https://avatar.vercel.sh/${encodeURIComponent(user.username)}`
			: "https://avatar.vercel.sh/teacher");

	const displayName = user?.profile?.displayName || user?.username || "School OS";
	const roleLabel = formatRoleLabel(tenantContext?.role);

	return (
		<View style={styles.container}>
			<View style={styles.left}>
				<Pressable
					style={styles.avatarContainer}
					onPress={() => router.replace("/(modules)/(profile)")}
				>
					<Image source={{ uri: avatarUri }} style={styles.avatar} />
					<View style={styles.onlineDot} />
				</Pressable>

				<View style={styles.textContainer}>
					<Text style={styles.greeting}>Welcome back,</Text>
					<Text style={styles.name} numberOfLines={1}>
						{displayName}
					</Text>
				</View>
			</View>

			<View style={styles.right}>
				<View style={styles.roleBadge}>
					<ShieldCheck size={12} color={AppColors.primary.brand} />
					<Text style={styles.roleText}>{roleLabel}</Text>
				</View>

				<Pressable style={styles.iconButton} onPress={() => router.replace("/(modules)/(profile)")}>
					<Bell size={20} color={AppColors.text.primary} strokeWidth={1.8} />
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		backgroundColor: AppColors.surface,
		borderBottomWidth: 1,
		borderBottomColor: AppColors.card.border,
		...AppShadows.sm,
	},
	left: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
	},
	avatarContainer: {
		position: "relative",
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: AppColors.card.subtle,
	},
	onlineDot: {
		position: "absolute",
		bottom: 1,
		right: 1,
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: AppColors.status.present,
		borderWidth: 2,
		borderColor: AppColors.surface,
	},
	textContainer: {
		flex: 1,
	},
	greeting: {
		fontSize: 11,
		fontWeight: "500",
		color: AppColors.text.muted,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	name: {
		fontSize: 16,
		fontWeight: "700",
		color: AppColors.text.primary,
	},
	right: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	roleBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: AppColors.primary.subtle,
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#DBEAFE",
	},
	roleText: {
		fontSize: 12,
		fontWeight: "600",
		color: AppColors.primary.brand,
	},
	iconButton: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: AppColors.card.subtle,
		alignItems: "center",
		justifyContent: "center",
		position: "relative",
	},
});

function formatRoleLabel(role?: string): string {
	if (!role) return "School OS";
	return role
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}
