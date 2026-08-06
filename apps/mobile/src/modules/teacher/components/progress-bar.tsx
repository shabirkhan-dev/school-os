import { StyleSheet, View } from "react-native";
import { AppColors } from "@/constants/design-system";

interface ProgressBarProps {
	value: number; // 0..100
	color?: string;
	trackColor?: string;
	height?: number;
}

export function ProgressBar({
	value,
	color = AppColors.primary.brand,
	trackColor = AppColors.card.subtle,
	height = 6,
}: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value));
	return (
		<View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
			<View
				style={[
					styles.fill,
					{ backgroundColor: color, width: `${clamped}%`, borderRadius: height / 2 },
				]}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		width: "100%",
		overflow: "hidden",
	},
	fill: {
		height: "100%",
	},
});
