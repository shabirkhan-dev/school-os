import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { AppColors, AppShadows } from "@/constants/design-system";
import { IconTile } from "./icon-tile";

interface MetricCardProps {
	label: string;
	value: string | number;
	hint?: string;
	icon: LucideIcon;
	color?: string;
	background?: string;
	alert?: boolean;
}

export function MetricCard({
	label,
	value,
	hint,
	icon,
	color = AppColors.primary.brand,
	background = AppColors.primary.subtle,
	alert,
}: MetricCardProps) {
	return (
		<View style={[styles.card, alert && styles.cardAlert]}>
			<View style={styles.topRow}>
				<Text style={styles.label}>{label}</Text>
				<IconTile icon={icon} color={color} background={background} size={32} iconSize={16} />
			</View>
			<Text style={styles.value}>{value}</Text>
			{hint ? <Text style={styles.hint}>{hint}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flex: 1,
		minWidth: "47%",
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		padding: 14,
		...AppShadows.sm,
	},
	cardAlert: {
		borderColor: "#FCD34D",
		backgroundColor: "#FFFBEB",
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	label: {
		color: AppColors.text.muted,
		fontSize: 11,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.4,
		flexShrink: 1,
		marginRight: 6,
	},
	value: {
		color: AppColors.text.primary,
		fontSize: 26,
		fontWeight: "800",
		letterSpacing: -0.5,
		fontVariant: ["tabular-nums"],
	},
	hint: {
		color: AppColors.text.secondary,
		fontSize: 11,
		marginTop: 3,
		lineHeight: 15,
	},
});
