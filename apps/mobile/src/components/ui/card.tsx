import type * as React from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";
import { PressableScale } from "./pressable-scale";

type CardDepth = "flat" | "raised" | "lifted" | "floating";

interface CardProps extends ViewProps {
	title?: string;
	description?: string;
	children?: React.ReactNode;
	onPress?: () => void;
	/**
	 * How far off the page the card sits. Keep at most one `floating` card per
	 * screen — competing hero elevations flatten each other out.
	 */
	depth?: CardDepth;
	/** Opt back into an outline where two same-elevation surfaces meet. */
	bordered?: boolean;
}

const DEPTH = {
	flat: Elevation.flush,
	raised: Elevation.raised,
	lifted: Elevation.lifted,
	floating: Elevation.floating,
} as const;

/**
 * Default content surface. Depth comes from a layered shadow plus a top-edge
 * catch light, so a column of these reads as stacked physical cards rather than
 * outlined boxes. Pressable cards drop to a shallower elevation while held.
 */
export function Card({
	title,
	description,
	children,
	onPress,
	depth = "raised",
	bordered = false,
	style,
	...props
}: CardProps) {
	const content = (
		<>
			{title ? <Text style={styles.title}>{title}</Text> : null}
			{description ? <Text style={styles.description}>{description}</Text> : null}
			{children}
		</>
	);

	const base = [styles.card, bordered && styles.bordered, style];

	if (onPress) {
		return (
			<PressableScale
				style={base}
				onPress={onPress}
				scaleTo={0.985}
				elevation={DEPTH[depth]}
				pressedElevation={depth === "flat" ? undefined : Elevation.raised}
				{...props}
			>
				{content}
			</PressableScale>
		);
	}

	return (
		<View style={[...base, DEPTH[depth]]} {...props}>
			{content}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: Colors.surface,
		borderRadius: Tokens.radius.xl,
		padding: Tokens.space["5"],
	},
	bordered: {
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
	},
	title: {
		...Type.subheading,
		marginBottom: Tokens.space["1"],
	},
	description: {
		...Type.caption,
		marginBottom: Tokens.space["3"],
	},
});
