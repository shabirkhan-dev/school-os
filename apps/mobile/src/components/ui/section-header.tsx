import { StyleSheet, Text, View } from "react-native";
import { Colors, Tokens, Type } from "@/constants/design-system";
import { PressableScale } from "./pressable-scale";

interface SectionHeaderProps {
	title: string;
	subtitle?: string;
	actionLabel?: string;
	onAction?: () => void;
}

/** Group label with an optional trailing action. Sets the vertical rhythm between sections. */
export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
	return (
		<View style={styles.container}>
			<View style={styles.copy}>
				<Text style={styles.title}>{title}</Text>
				{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
			</View>

			{actionLabel && onAction ? (
				<PressableScale
					onPress={onAction}
					style={styles.action}
					scaleTo={0.94}
					accessibilityRole="button"
					accessibilityLabel={actionLabel}
				>
					<Text style={styles.actionLabel}>{actionLabel}</Text>
				</PressableScale>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: Tokens.space["3"],
		paddingHorizontal: Tokens.space["5"],
		marginTop: Tokens.space["7"],
		marginBottom: Tokens.space["3"],
	},
	copy: { flex: 1 },
	title: Type.heading,
	subtitle: {
		...Type.caption,
		marginTop: Tokens.space["0.5"],
	},
	action: {
		paddingVertical: Tokens.space["1.5"],
		paddingHorizontal: Tokens.space["3"],
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.sunken,
	},
	actionLabel: {
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.semibold,
		color: Colors.text.secondary,
		letterSpacing: Tokens.tracking.snug,
	},
});
