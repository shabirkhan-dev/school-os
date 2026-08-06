import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from "react-native-reanimated";
import { Colors, Shadows, Tokens } from "@/constants/design-system";

interface SkeletonProps {
	width?: number | `${number}%`;
	height?: number;
	radius?: number;
	style?: ViewStyle;
}

/** Pulsing placeholder. Locks layout so content does not jump when it arrives. */
export function Skeleton({
	width = "100%",
	height = 16,
	radius = Tokens.radius.sm,
	style,
}: SkeletonProps) {
	const pulse = useSharedValue(0.4);

	useEffect(() => {
		pulse.value = withRepeat(
			withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
			-1,
			true,
		);
	}, [pulse]);

	const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

	return (
		<Animated.View
			style={[
				{ width, height, borderRadius: radius, backgroundColor: Colors.sunken },
				animatedStyle,
				style,
			]}
		/>
	);
}

export function SkeletonStatCard() {
	return (
		<View style={styles.statTile}>
			<Skeleton width="60%" height={9} />
			<Skeleton width={64} height={26} radius={Tokens.radius.xs} style={styles.statValue} />
			<Skeleton width="75%" height={9} />
		</View>
	);
}

export function SkeletonRow() {
	return (
		<View style={styles.row}>
			<Skeleton width={42} height={42} radius={Tokens.radius.md} />
			<View style={styles.rowCopy}>
				<Skeleton width="65%" height={14} />
				<Skeleton width="50%" height={11} style={styles.rowMeta} />
			</View>
		</View>
	);
}

export function SkeletonDashboard() {
	return (
		<View style={styles.dashboard}>
			<View style={styles.strip}>
				<SkeletonStatCard />
				<SkeletonStatCard />
				<SkeletonStatCard />
			</View>
			<View style={styles.list}>
				<SkeletonRow />
				<SkeletonRow />
				<SkeletonRow />
			</View>
		</View>
	);
}

const GUTTER = Tokens.space["5"];

const styles = StyleSheet.create({
	dashboard: { paddingHorizontal: GUTTER, gap: Tokens.space["5"] },

	strip: { flexDirection: "row", gap: Tokens.space["2.5"], marginTop: Tokens.space["3"] },
	statTile: {
		flex: 1,
		paddingVertical: Tokens.space["4"],
		paddingHorizontal: Tokens.space["3.5"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		gap: Tokens.space["2"],
		...Shadows.xs,
	},
	statValue: { marginTop: Tokens.space["1"] },

	list: { gap: Tokens.space["2.5"] },
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		paddingVertical: Tokens.space["4"],
		paddingHorizontal: Tokens.space["4"],
		borderRadius: Tokens.radius.xl,
		backgroundColor: Colors.surface,
		...Shadows.xs,
	},
	rowCopy: { flex: 1, gap: Tokens.space["1.5"] },
	rowMeta: { marginTop: Tokens.space["0.5"] },
});
