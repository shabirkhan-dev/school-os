import { StyleSheet, Text } from "react-native";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Elevation, Tokens } from "@/constants/design-system";

interface ChipProps {
	label: string;
	selected?: boolean;
	/** Fill colour when selected. Defaults to charcoal. */
	accent?: string;
	onPress?: () => void;
}

/**
 * Filter pill. Selected state is a solid fill rather than a tinted outline,
 * so an active filter is unmistakable in a row of six.
 */
export function Chip({ label, selected, accent = Colors.ink.base, onPress }: ChipProps) {
	return (
		<PressableScale
			style={[styles.chip, selected ? { backgroundColor: accent } : styles.chipIdle]}
			scaleTo={0.95}
			onPress={onPress}
			accessibilityRole="button"
			accessibilityState={{ selected: Boolean(selected) }}
			accessibilityLabel={label}
		>
			<Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	chip: {
		paddingHorizontal: Tokens.space["3.5"],
		paddingVertical: Tokens.space["2"],
		borderRadius: Tokens.radius.full,
	},
	chipIdle: {
		backgroundColor: Colors.surface,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
		...Elevation.raised,
	},
	label: {
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
		color: Colors.text.secondary,
		letterSpacing: Tokens.tracking.snug,
		textTransform: "capitalize",
	},
	labelSelected: {
		color: Colors.text.inverse,
		fontWeight: Tokens.fontWeight.bold,
	},
});
