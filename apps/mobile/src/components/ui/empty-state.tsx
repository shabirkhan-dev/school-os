import type { LucideIcon } from "lucide-react-native";
import type * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppColors } from "@/constants/design-system";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: string;
	children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
	return (
		<View style={styles.container}>
			<View style={styles.iconCircle}>
				<Icon size={28} color={AppColors.primary.brand} strokeWidth={1.8} />
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
		paddingVertical: 36,
		paddingHorizontal: 24,
		backgroundColor: AppColors.surface,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		marginHorizontal: 16,
		marginVertical: 12,
	},
	iconCircle: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: AppColors.primary.subtle,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 12,
	},
	title: {
		fontSize: 16,
		fontWeight: "700",
		color: AppColors.text.primary,
		textAlign: "center",
		marginBottom: 4,
	},
	description: {
		fontSize: 13,
		color: AppColors.text.secondary,
		textAlign: "center",
		lineHeight: 18,
	},
	actions: {
		marginTop: 16,
	},
});
