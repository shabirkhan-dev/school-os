import type * as React from "react";
import { Pressable, StyleSheet, Text, View, type ViewProps } from "react-native";
import { AppColors, AppShadows } from "@/constants/design-system";

interface CardProps extends ViewProps {
	title?: string;
	description?: string;
	children?: React.ReactNode;
	onPress?: () => void;
	bordered?: boolean;
}

export function Card({
	title,
	description,
	children,
	onPress,
	bordered = true,
	style,
	...props
}: CardProps) {
	const content = (
		<>
			{title && <Text style={styles.title}>{title}</Text>}
			{description && <Text style={styles.description}>{description}</Text>}
			{children}
		</>
	);

	if (onPress) {
		return (
			<Pressable
				onPress={onPress}
				style={({ pressed }) => [
					styles.card,
					bordered && styles.border,
					pressed && styles.pressed,
					style,
				]}
				{...props}
			>
				{content}
			</Pressable>
		);
	}

	return (
		<View style={[styles.card, bordered && styles.border, style]} {...props}>
			{content}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		padding: 16,
		...AppShadows.sm,
	},
	border: {
		borderWidth: 1,
		borderColor: AppColors.card.border,
	},
	title: {
		fontSize: 16,
		fontWeight: "700",
		color: AppColors.text.primary,
		marginBottom: 4,
	},
	description: {
		fontSize: 13,
		color: AppColors.text.secondary,
		marginBottom: 12,
		lineHeight: 18,
	},
	pressed: {
		opacity: 0.9,
		transform: [{ scale: 0.995 }],
	},
});
