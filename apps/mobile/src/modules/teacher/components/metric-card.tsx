import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { IconTile } from "@/components/ui/icon-tile";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";

interface MetricCardProps {
	label: string;
	value: string | number;
	hint?: string;
	icon: LucideIcon;
	/** Explicit overrides for callers with dynamic colours. */
	color?: string;
	background?: string;
	/** Amber tint for values that need attention. */
	alert?: boolean;
}

/**
 * Headline figure tile. Icon top-right, large metric, supporting hint below.
 *
 * These pack into a flex-wrap row and auto-collapse into two columns on phone,
 * so callers pass 4–6 items and the viewport decides the grid.
 */
export function MetricCard({
	label,
	value,
	hint,
	icon,
	color,
	background,
	alert,
}: MetricCardProps) {
	return (
		<View style={[styles.card, alert && styles.cardAlert]}>
			<View style={styles.topRow}>
				<Text style={styles.label}>{label}</Text>
				<IconTile icon={icon} color={color} background={background} size="sm" />
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
		backgroundColor: Colors.surface,
		borderRadius: Tokens.radius.xl,
		padding: Tokens.space["4"],
		gap: Tokens.space["2"],
		...Elevation.raised,
	},
	cardAlert: {
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.status.late.border,
		backgroundColor: Colors.status.late.bg,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	label: {
		...Type.overline,
		flexShrink: 1,
		marginRight: Tokens.space["2"],
	},
	value: {
		...Type.metricSm,
		marginTop: Tokens.space["1"],
	},
	hint: {
		...Type.caption,
	},
});
