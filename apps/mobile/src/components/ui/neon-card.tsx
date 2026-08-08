import type * as React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { Colors, Elevation, Tokens } from "@/constants/design-system";

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
		backgroundColor: Colors.surface,
		borderRadius: Tokens.radius["2xl"],
		padding: Tokens.space["6"],
		...Elevation.lifted,
	},
});
