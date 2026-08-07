import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Colors, Tokens } from "@/constants/design-system";

interface ProgressBarProps {
	/** 0–100. Values outside the range are clamped. */
	value: number;
	color?: string;
	trackColor?: string;
	height?: number;
}

/**
 * Horizontal progress track.
 *
 * The fill springs from its previous width rather than jumping, which matters
 * on report screens where several bars settle as their queries resolve — the
 * staggered motion reads as data arriving.
 */
export function ProgressBar({
	value,
	color = Colors.ink.base,
	trackColor = Colors.sunken,
	height = 6,
}: ProgressBarProps) {
	const clamped = Math.max(0, Math.min(100, value));
	const width = useSharedValue(0);

	useEffect(() => {
		width.value = withSpring(clamped, Tokens.spring.gentle);
	}, [clamped, width]);

	const fillStyle = useAnimatedStyle(() => ({
		width: `${width.value}%`,
	}));

	return (
		<View style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height / 2 }]}>
			<Animated.View
				style={[styles.fill, { backgroundColor: color, borderRadius: height / 2 }, fillStyle]}
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
