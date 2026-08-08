import type * as React from "react";
import { useState } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Elevation } from "@/constants/design-system";
import { Tokens } from "@/constants/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Named elevation preset, or a raw style object for one-off cases. */
export type ElevationPreset = keyof typeof Elevation | ViewStyle;

interface PressableScaleProps extends Omit<PressableProps, "style"> {
	children?: React.ReactNode;
	style?: StyleProp<ViewStyle>;
	/** Scale target while held. Large surfaces need less travel to read as equal. */
	scaleTo?: number;
	/** Fade slightly alongside the scale. Disable on elements that must stay legible. */
	dim?: boolean;
	/** Rest elevation. */
	elevation?: ElevationPreset;
	/**
	 * Elevation while held. Set this to a shallower level than `elevation` and the
	 * surface reads as being pushed into the page rather than merely shrinking —
	 * the shadow collapsing is what sells the press as physical.
	 */
	pressedElevation?: ElevationPreset;
}

function resolveElevation(preset: ElevationPreset | undefined): ViewStyle {
	if (!preset) return {};
	return typeof preset === "string" ? Elevation[preset] : preset;
}

/**
 * Press feedback on a spring, driven on the UI thread so it stays smooth while
 * JS is busy. Scale and a slight downward travel are animated; the shadow stack
 * swaps on press, which is a step rather than a ramp but lands under the spring
 * and reads as continuous.
 */
export function PressableScale({
	children,
	style,
	scaleTo = 0.98,
	dim = true,
	elevation,
	pressedElevation,
	onPressIn,
	onPressOut,
	...props
}: PressableScaleProps) {
	const pressed = useSharedValue(0);
	const [isPressed, setIsPressed] = useState(false);

	const restStyle = resolveElevation(elevation);
	const heldStyle = resolveElevation(pressedElevation ?? elevation);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [
			{ scale: withSpring(pressed.value ? scaleTo : 1, Tokens.spring.snappy) },
			{ translateY: withSpring(pressed.value ? 1 : 0, Tokens.spring.snappy) },
		],
		opacity: withSpring(dim && pressed.value ? 0.92 : 1, Tokens.spring.snappy),
	}));

	return (
		<AnimatedPressable
			onPressIn={(event) => {
				pressed.value = 1;
				if (pressedElevation) setIsPressed(true);
				onPressIn?.(event);
			}}
			onPressOut={(event) => {
				pressed.value = 0;
				if (pressedElevation) setIsPressed(false);
				onPressOut?.(event);
			}}
			style={[style, isPressed ? heldStyle : restStyle, animatedStyle]}
			{...props}
		>
			{children}
		</AnimatedPressable>
	);
}
