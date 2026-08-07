import { useEffect, useState } from "react";
import { type LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Shadows, Tokens } from "@/constants/design-system";

interface SegmentedOption<T extends string> {
	label: string;
	value: T;
}

interface SegmentedProps<T extends string> {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
}

const PADDING = Tokens.space["1"];

/**
 * Segmented control with a single thumb that springs between slots.
 *
 * One shared moving element rather than per-segment fades, so the eye tracks
 * the selection instead of watching two things cross-dissolve. Width comes from
 * onLayout because the control is fluid.
 */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
	const [trackWidth, setTrackWidth] = useState(0);
	const index = Math.max(
		0,
		options.findIndex((option) => option.value === value),
	);

	const slotWidth = trackWidth > 0 ? (trackWidth - PADDING * 2) / options.length : 0;
	const offset = useSharedValue(0);

	useEffect(() => {
		offset.value = withSpring(index * slotWidth, Tokens.spring.snappy);
	}, [index, slotWidth, offset]);

	const thumbStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: offset.value }],
	}));

	const onLayout = (event: LayoutChangeEvent) => setTrackWidth(event.nativeEvent.layout.width);

	return (
		<View style={styles.track} onLayout={onLayout}>
			{slotWidth > 0 ? (
				<Animated.View style={[styles.thumb, { width: slotWidth }, thumbStyle]} />
			) : null}

			{options.map((option) => {
				const selected = option.value === value;
				return (
					<PressableScale
						key={option.value}
						style={styles.segment}
						scaleTo={0.96}
						dim={false}
						onPress={() => onChange(option.value)}
						accessibilityRole="button"
						accessibilityState={{ selected }}
						accessibilityLabel={option.label}
					>
						<Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
							{option.label}
						</Text>
					</PressableScale>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	track: {
		flexDirection: "row",
		position: "relative",
		backgroundColor: Colors.sunken,
		borderRadius: Tokens.radius.md,
		padding: PADDING,
	},
	thumb: {
		position: "absolute",
		left: PADDING,
		top: PADDING,
		bottom: PADDING,
		borderRadius: Tokens.radius.sm,
		backgroundColor: Colors.surface,
		...Shadows.xs,
	},
	segment: {
		flex: 1,
		zIndex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Tokens.space["2.5"],
	},
	label: {
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
		color: Colors.text.tertiary,
		letterSpacing: Tokens.tracking.snug,
	},
	labelSelected: {
		color: Colors.text.primary,
		fontWeight: Tokens.fontWeight.bold,
	},
});
