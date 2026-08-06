import type * as React from "react";
import { StyleSheet, Text, View, type ViewProps } from "react-native";
import { Colors, Shadows, Tokens, Type } from "@/constants/design-system";
import { PressableScale } from "./pressable-scale";

interface CardProps extends ViewProps {
	title?: string;
	description?: string;
	children?: React.ReactNode;
	onPress?: () => void;
	/** Raise above neighbouring cards. Use for the one card that matters most. */
	elevated?: boolean;
	/** Opt back into an outline where two same-elevation surfaces meet. */
	bordered?: boolean;
}

/**
 * Default content surface. Separation comes from shadow rather than an outline,
 * so a column of these reads as stacked paper instead of a wireframe.
 */
export function Card({
	title,
	description,
	children,
	onPress,
	elevated = false,
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

	const composed = [
		styles.card,
		elevated ? styles.elevated : styles.resting,
		bordered && styles.bordered,
		style,
	];

	if (onPress) {
		return (
			<PressableScale style={composed} onPress={onPress} scaleTo={0.985} {...props}>
				{content}
			</PressableScale>
		);
	}

	return (
		<View style={composed} {...props}>
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
	resting: Shadows.xs,
	elevated: Shadows.sm,
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
