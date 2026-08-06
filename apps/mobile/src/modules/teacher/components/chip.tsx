import { Pressable, StyleSheet, Text } from "react-native";
import { AppColors } from "@/constants/design-system";

interface ChipProps {
	label: string;
	selected?: boolean;
	accent?: string;
	onPress?: () => void;
}

export function Chip({ label, selected, accent = AppColors.primary.brand, onPress }: ChipProps) {
	return (
		<Pressable
			style={({ pressed }) => [
				styles.container,
				selected ? { backgroundColor: accent, borderColor: accent } : null,
				pressed && styles.pressed,
			]}
			onPress={onPress}
		>
			<Text style={[styles.label, selected ? styles.labelSelected : null]}>{label}</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		backgroundColor: AppColors.surface,
	},
	label: {
		fontSize: 13,
		fontWeight: "600",
		color: AppColors.text.secondary,
	},
	labelSelected: {
		color: AppColors.text.inverse,
		fontWeight: "700",
	},
	pressed: {
		opacity: 0.75,
		transform: [{ scale: 0.98 }],
	},
});
