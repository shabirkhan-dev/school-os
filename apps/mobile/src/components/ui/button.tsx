import type { LucideIcon } from "lucide-react-native";
import {
	ActivityIndicator,
	type PressableProps,
	type StyleProp,
	StyleSheet,
	Text,
	View,
	type ViewStyle,
} from "react-native";
import { Colors, Elevation, Tokens } from "@/constants/design-system";
import { PressableScale } from "./pressable-scale";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
	label: string;
	variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
	size?: "sm" | "md" | "lg";
	icon?: LucideIcon;
	loading?: boolean;
	style?: StyleProp<ViewStyle>;
}

export function Button({
	label,
	variant = "primary",
	size = "md",
	icon: Icon,
	loading = false,
	disabled,
	style,
	...props
}: ButtonProps) {
	const isInteractive = !disabled && !loading;

	return (
		<PressableScale
			disabled={!isInteractive}
			scaleTo={size === "lg" ? 0.98 : 0.965}
			dim={false}
			accessibilityRole="button"
			accessibilityState={{ disabled: !isInteractive, busy: loading }}
			style={[
				styles.base,
				styles[variant],
				styles[`size_${size}`],
				!isInteractive && styles.disabled,
				style,
			]}
			{...props}
		>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={variant === "primary" ? Colors.ink.foreground : Colors.brand.base}
				/>
			) : (
				<View style={styles.content}>
					{Icon ? (
						<Icon
							size={size === "sm" ? 14 : size === "lg" ? 20 : 16}
							color={getTextColor(variant, disabled ?? undefined)}
							strokeWidth={2}
						/>
					) : null}
					<Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]]}>
						{label}
					</Text>
				</View>
			)}
		</PressableScale>
	);
}

function getTextColor(variant: ButtonProps["variant"], disabled?: boolean) {
	if (disabled) return Colors.text.muted;
	switch (variant) {
		case "primary":
		case "destructive":
			return Colors.text.inverse;
		case "outline":
		case "ghost":
		case "secondary":
			return Colors.text.primary;
		default:
			return Colors.text.inverse;
	}
}

const styles = StyleSheet.create({
	base: {
		borderRadius: Tokens.radius.sm,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["1.5"],
	},
	size_sm: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		height: 34,
	},
	size_md: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		height: 44,
	},
	size_lg: {
		paddingHorizontal: 20,
		paddingVertical: 14,
		height: 52,
	},
	primary: {
		backgroundColor: Colors.ink.base,
		...Elevation.raisedDark,
	},
	secondary: {
		backgroundColor: Colors.surface,
		...Elevation.raised,
	},
	outline: {
		backgroundColor: Colors.surfaceBright,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
	},
	ghost: {
		backgroundColor: "transparent",
	},
	destructive: {
		backgroundColor: Colors.status.absent.solid,
		...Elevation.lifted,
	},
	disabled: {
		opacity: 0.5,
	},
	text: {
		fontWeight: "600",
	},
	textSize_sm: {
		fontSize: 12,
	},
	textSize_md: {
		fontSize: 14,
	},
	textSize_lg: {
		fontSize: 16,
	},
	text_primary: {
		color: Colors.text.inverse,
	},
	text_secondary: {
		color: Colors.text.primary,
	},
	text_outline: {
		color: Colors.text.primary,
	},
	text_ghost: {
		color: Colors.brand.base,
	},
	text_destructive: {
		color: Colors.text.inverse,
	},
});
