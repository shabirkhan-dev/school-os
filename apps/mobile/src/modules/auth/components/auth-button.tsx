import type { LucideIcon } from "lucide-react-native";
import { ActivityIndicator, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Elevation, Tokens } from "@/constants/design-system";

interface AuthButtonProps {
	label: string;
	onPress: () => void;
	pending?: boolean;
	disabled?: boolean;
	variant?: "primary" | "outline" | "ghost";
	style?: ViewStyle;
	icon?: LucideIcon;
}

export function AuthButton({
	label,
	onPress,
	pending = false,
	disabled = false,
	variant = "primary",
	style,
	icon: Icon,
}: AuthButtonProps) {
	const isDisabled = disabled || pending;
	return (
		<PressableScale
			onPress={onPress}
			disabled={isDisabled}
			scaleTo={0.975}
			dim={false}
			accessibilityRole="button"
			accessibilityState={{ disabled: isDisabled, busy: pending }}
			style={[
				styles.base,
				variant === "primary" && styles.primary,
				variant === "outline" && styles.outline,
				variant === "ghost" && styles.ghost,
				isDisabled && styles.disabled,
				style,
			]}
		>
			{pending ? (
				<ActivityIndicator
					color={variant === "primary" ? Colors.ink.foreground : Colors.brand.base}
				/>
			) : (
				<View style={styles.content}>
					{Icon ? (
						<Icon
							size={18}
							strokeWidth={2.1}
							color={variant === "primary" ? Colors.ink.foreground : Colors.text.primary}
						/>
					) : null}
					<Text
						style={[
							styles.label,
							variant === "primary" && styles.primaryLabel,
							variant !== "primary" && styles.secondaryLabel,
						]}
					>
						{label}
					</Text>
				</View>
			)}
		</PressableScale>
	);
}

const styles = StyleSheet.create({
	base: {
		minHeight: 52,
		borderRadius: Tokens.radius.md,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: Tokens.space["4"],
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Tokens.space["2"],
	},
	primary: {
		backgroundColor: Colors.ink.base,
		...Elevation.raisedDark,
	},
	outline: {
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
		backgroundColor: Colors.surfaceBright,
		...Elevation.raised,
	},
	ghost: {
		backgroundColor: "transparent",
	},
	disabled: {
		opacity: 0.45,
	},
	label: {
		fontSize: Tokens.fontSize.lg,
		fontWeight: Tokens.fontWeight.bold,
		letterSpacing: Tokens.tracking.snug,
	},
	primaryLabel: {
		color: Colors.ink.foreground,
	},
	secondaryLabel: {
		color: Colors.text.primary,
	},
});
