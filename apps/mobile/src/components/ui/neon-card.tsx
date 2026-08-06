import type * as React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { AppColors, AppShadows } from "@/constants/design-system";

interface NeonCardProps {
	children: React.ReactNode;
	style?: ViewStyle;
	glowPosition?: "top-right" | "bottom-left" | "both-diagonal" | "none";
}

export function NeonCard({ children, style }: NeonCardProps) {
	return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		padding: 24,
		...AppShadows.sm,
	},
});
