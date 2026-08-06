import type { LucideIcon } from "lucide-react-native";
import type * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Shadows, Tokens, Type } from "@/constants/design-system";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	children?: React.ReactNode;
}

/** Centred placeholder explaining why a region is empty and what fills it. */
export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
	return (
		<View style={styles.container}>
			<View style={styles.iconWell}>
				<Icon size={24} color={Colors.text.tertiary} strokeWidth={1.7} />
			</View>
			<Text style={styles.title}>{title}</Text>
			<Text style={styles.description}>{description}</Text>
			{children ? <View style={styles.actions}>{children}</View> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: Tokens.space["10"],
		paddingHorizontal: Tokens.space["6"],
		marginHorizontal: Tokens.space["5"],
		borderRadius: Tokens.radius["2xl"],
		backgroundColor: Colors.surface,
		...Shadows.xs,
	},
	iconWell: {
		width: 52,
		height: 52,
		borderRadius: Tokens.radius.lg,
		backgroundColor: Colors.sunken,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: Tokens.space["4"],
	},
	title: {
		...Type.subheading,
		textAlign: "center",
	},
	description: {
		...Type.caption,
		textAlign: "center",
		marginTop: Tokens.space["1.5"],
		maxWidth: 280,
	},
	actions: {
		marginTop: Tokens.space["5"],
	},
});
