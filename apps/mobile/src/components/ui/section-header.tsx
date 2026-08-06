import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppColors } from "@/constants/design-system";

interface SectionHeaderProps {
	title: string;
	subtitle?: string;
	actionLabel?: string;
	onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
	return (
		<View style={styles.container}>
			<View style={styles.textWrapper}>
				<Text style={styles.title}>{title}</Text>
				{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
			</View>

			{actionLabel && onAction ? (
				<Pressable
					onPress={onAction}
					style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
				>
					<Text style={styles.actionText}>{actionLabel}</Text>
				</Pressable>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		marginBottom: 12,
		marginTop: 16,
		paddingHorizontal: 16,
	},
	textWrapper: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: "700",
		color: AppColors.text.primary,
		letterSpacing: -0.2,
	},
	subtitle: {
		fontSize: 12,
		color: AppColors.text.muted,
		marginTop: 2,
	},
	actionBtn: {
		paddingVertical: 4,
		paddingHorizontal: 8,
	},
	actionText: {
		fontSize: 13,
		fontWeight: "600",
		color: AppColors.primary.brand,
	},
	pressed: {
		opacity: 0.7,
	},
});
