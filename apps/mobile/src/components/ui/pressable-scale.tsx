import type * as React from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Tokens } from "@/constants/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends Omit<PressableProps, "style"> {
	children?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	/** Scale target while held. Large surfaces need less travel to read as equal. */
	scaleTo?: number;
	/** Fade slightly alongside the scale. Disable on elements that must stay legible. */
	dim?: boolean;
}

/**
 * Press feedback on a spring, driven on the UI thread so it stays smooth while
 * JS is busy. Replaces the `pressed && styles.pressed` pattern, which snaps
 * between two states instead of settling.
 */
export function PressableScale({
	children,
	style,
	scaleTo = 0.98,
	dim = true,
	...props
}: PressableScaleProps) {
	const pressed = useSharedValue(0);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: withSpring(pressed.value ? scaleTo : 1, Tokens.spring.snappy) }],
		opacity: withSpring(dim && pressed.value ? 0.9 : 1, Tokens.spring.snappy),
	}));

	return (
		<AnimatedPressable
			onPressIn={() => {
				pressed.value = 1;
			}}
			onPressOut={() => {
				pressed.value = 0;
			}}
			style={[style, animatedStyle]}
			{...props}
		>
			{children}
		</AnimatedPressable>
	);
}
