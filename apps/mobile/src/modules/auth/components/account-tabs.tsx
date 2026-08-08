import { router } from "expo-router";
import { ShieldCheck, UserRound } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Elevation, Tokens } from "@/constants/design-system";

type AccountTab = "profile" | "security";

export function AccountTabs({ active }: { active: AccountTab }) {
	return (
		<View style={styles.row}>
			<Tab
				label="Profile"
				icon={UserRound}
				active={active === "profile"}
				onPress={() => router.replace("/(modules)/(profile)")}
			/>
			<Tab
				label="Security"
				icon={ShieldCheck}
				active={active === "security"}
				onPress={() => router.replace("/(modules)/(profile)/security")}
			/>
		</View>
	);
}

function Tab({
	label,
	icon: Icon,
	active,
	onPress,
}: {
	label: string;
	icon: typeof UserRound;
	active: boolean;
	onPress: () => void;
}) {
	return (
		<PressableScale
			onPress={onPress}
			style={[styles.tab, active && styles.tabActive]}
			scaleTo={0.96}
			dim={false}
			accessibilityRole="tab"
			accessibilityState={{ selected: active }}
		>
			<Icon
				size={16}
				color={active ? Colors.text.primary : Colors.text.tertiary}
				strokeWidth={active ? 2.2 : 1.8}
			/>
			<Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		gap: Tokens.space["1"],
		padding: Tokens.space["1"],
		borderRadius: Tokens.radius.md,
		backgroundColor: Colors.sunken,
		...Elevation.well,
	},
	tab: {
		flex: 1,
		minHeight: Tokens.touchTarget,
		borderRadius: Tokens.radius.sm,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Tokens.space["1.5"],
		paddingHorizontal: Tokens.space["2"],
	},
	tabActive: {
		backgroundColor: Colors.surfaceBright,
		...Elevation.raised,
	},
	label: {
		color: Colors.text.secondary,
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
	},
	labelActive: {
		color: Colors.text.primary,
		fontWeight: Tokens.fontWeight.bold,
	},
});
