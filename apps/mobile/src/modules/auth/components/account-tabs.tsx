import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NeonColors } from "@/constants/design-system";

type AccountTab = "profile" | "security";

export function AccountTabs({ active }: { active: AccountTab }) {
	return (
		<View style={styles.row}>
			<Tab
				label="Profile"
				active={active === "profile"}
				onPress={() => router.replace("/(modules)/(profile)")}
			/>
			<Tab
				label="Security"
				active={active === "security"}
				onPress={() => router.replace("/(modules)/(profile)/security")}
			/>
		</View>
	);
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}
		>
			<Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		gap: 6,
		padding: 4,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: NeonColors.card.border,
		backgroundColor: "rgba(255,255,255,0.03)",
	},
	tab: {
		flex: 1,
		minHeight: 40,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 4,
	},
	tabActive: {
		backgroundColor: "rgba(0, 230, 118, 0.12)",
		borderWidth: 1,
		borderColor: "rgba(0, 230, 118, 0.35)",
	},
	label: {
		color: NeonColors.text.secondary,
		fontSize: 13,
		fontWeight: "600",
	},
	labelActive: {
		color: NeonColors.accent.green,
	},
	pressed: {
		opacity: 0.85,
	},
});
