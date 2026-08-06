import type { ReactNode } from "react";
import { useEffect } from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Shadows, Tokens } from "@/constants/design-system";
import { PressableScale } from "./pressable-scale";

/**
 * Structural props rather than `BottomTabBarProps`.
 *
 * expo-router and @react-navigation/bottom-tabs each ship their own copy of
 * that type and they are not mutually assignable, so importing either one
 * breaks at the call site. Declaring only what this component reads keeps it
 * compatible with both.
 */
export interface TabBarProps {
	state: {
		index: number;
		routes: Array<{ key: string; name: string }>;
	};
	descriptors: Record<
		string,
		{
			options: {
				title?: string;
				tabBarLabel?: unknown;
				tabBarIcon?: (props: { focused: boolean; color: string; size: number }) => ReactNode;
			};
		}
	>;
	navigation: {
		emit(event: { type: "tabPress"; target: string; canPreventDefault: true }): {
			defaultPrevented: boolean;
		};
		navigate(name: string): void;
	};
}

const SIDE_INSET = Tokens.space["4"];
const TRACK_PADDING = Tokens.space["1.5"];
const PILL_HEIGHT = 56;

/**
 * Height a scroll view must reserve at the bottom so its last row is not
 * covered by the floating bar. Screens add this to `contentContainerStyle`.
 */
export const TAB_BAR_CLEARANCE = PILL_HEIGHT + Tokens.space["4"];

/**
 * Floating pill navigation.
 *
 * Detached from the screen edge so content scrolls beneath it, which keeps the
 * chrome feeling light. The active pill is a single shared element that springs
 * between slots rather than fading in and out per tab — one continuous motion
 * instead of four independent ones.
 */
export function TabBar({ state, descriptors, navigation }: TabBarProps) {
	const insets = useSafeAreaInsets();
	const { width } = useWindowDimensions();

	const count = state.routes.length;
	const trackWidth = width - SIDE_INSET * 2 - TRACK_PADDING * 2;
	const slotWidth = trackWidth / count;

	const offset = useSharedValue(state.index * slotWidth);

	useEffect(() => {
		offset.value = withSpring(state.index * slotWidth, Tokens.spring.snappy);
	}, [state.index, slotWidth, offset]);

	const pillStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: offset.value }],
	}));

	return (
		<View
			pointerEvents="box-none"
			style={[styles.host, { paddingBottom: Math.max(insets.bottom, Tokens.space["3"]) }]}
		>
			<View style={[styles.bar, { marginHorizontal: SIDE_INSET, padding: TRACK_PADDING }]}>
				<Animated.View style={[styles.pill, { width: slotWidth }, pillStyle]} />

				{state.routes.map((route, index) => {
					const { options } = descriptors[route.key];
					const rawLabel = options.tabBarLabel ?? options.title ?? route.name;
					const label = typeof rawLabel === "string" ? rawLabel : route.name;
					const focused = state.index === index;

					return (
						<TabItem
							key={route.key}
							label={label}
							icon={options.tabBarIcon}
							focused={focused}
							width={slotWidth}
							onPress={() => {
								const event = navigation.emit({
									type: "tabPress",
									target: route.key,
									canPreventDefault: true,
								});
								if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
							}}
						/>
					);
				})}
			</View>
		</View>
	);
}

interface TabItemProps {
	label: string;
	icon?: (props: { focused: boolean; color: string; size: number }) => ReactNode;
	focused: boolean;
	width: number;
	onPress: () => void;
}

function TabItem({ label, icon, focused, width, onPress }: TabItemProps) {
	const lift = useSharedValue(focused ? 1 : 0);

	useEffect(() => {
		lift.value = withSpring(focused ? 1 : 0, Tokens.spring.snappy);
	}, [focused, lift]);

	const iconStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: -lift.value * 1.5 }, { scale: 0.94 + lift.value * 0.06 }],
	}));

	const color = focused ? Colors.text.primary : Colors.text.muted;

	return (
		<PressableScale
			onPress={onPress}
			style={[styles.item, { width }]}
			scaleTo={0.9}
			dim={false}
			accessibilityRole="button"
			accessibilityState={{ selected: focused }}
			accessibilityLabel={label}
		>
			<Animated.View style={iconStyle}>{icon?.({ focused, color, size: 20 })}</Animated.View>
			<Text style={[styles.label, focused && styles.labelActive, { color }]} numberOfLines={1}>
				{label}
			</Text>
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	host: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "transparent",
	},
	bar: {
		flexDirection: "row",
		alignItems: "center",
		position: "relative",
		height: PILL_HEIGHT,
		borderRadius: Tokens.radius["2xl"],
		backgroundColor: Colors.surface,
		...Shadows.lg,
	},
	pill: {
		position: "absolute",
		left: TRACK_PADDING,
		top: TRACK_PADDING,
		bottom: TRACK_PADDING,
		borderRadius: Tokens.radius.lg,
		backgroundColor: Colors.sunken,
	},
	item: {
		zIndex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: 3,
		height: "100%",
	},
	label: {
		fontSize: Tokens.fontSize["2xs"],
		fontWeight: Tokens.fontWeight.semibold,
		letterSpacing: Tokens.tracking.snug,
	},
	labelActive: {
		fontWeight: Tokens.fontWeight.bold,
	},
});
