import type { LucideIcon } from "lucide-react-native";
import {
	ActivityIndicator,
	Pressable,
	type PressableProps,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { AppColors } from "@/constants/design-system";

interface ButtonProps extends Omit<PressableProps, "children"> {
	label: string;
	variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
	size?: "sm" | "md" | "lg";
	icon?: LucideIcon;
	loading?: boolean;
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
		<Pressable
			disabled={!isInteractive}
			style={({ pressed }) => [
				styles.base,
				styles[variant],
				styles[`size_${size}`],
				disabled && styles.disabled,
				pressed && isInteractive && styles.pressed,
				typeof style === "function" ? style({ pressed, hovered: false }) : style,
			]}
			{...props}
		>
			{loading ? (
				<ActivityIndicator
					size="small"
					color={variant === "primary" ? AppColors.text.inverse : AppColors.primary.brand}
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
		</Pressable>
	);
}

function getTextColor(variant: ButtonProps["variant"], disabled?: boolean) {
	if (disabled) return AppColors.text.muted;
	switch (variant) {
		case "primary":
		case "destructive":
			return AppColors.text.inverse;
		case "outline":
		case "ghost":
		case "secondary":
			return AppColors.text.primary;
		default:
			return AppColors.text.inverse;
	}
}

const styles = StyleSheet.create({
	base: {
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
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
		backgroundColor: AppColors.primary.main,
	},
	secondary: {
		backgroundColor: AppColors.card.subtle,
	},
	outline: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: AppColors.card.border,
	},
	ghost: {
		backgroundColor: "transparent",
	},
	destructive: {
		backgroundColor: AppColors.status.absent,
	},
	disabled: {
		opacity: 0.5,
	},
	pressed: {
		opacity: 0.85,
		transform: [{ scale: 0.98 }],
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
		color: AppColors.text.inverse,
	},
	text_secondary: {
		color: AppColors.text.primary,
	},
	text_outline: {
		color: AppColors.text.primary,
	},
	text_ghost: {
		color: AppColors.primary.brand,
	},
	text_destructive: {
		color: AppColors.text.inverse,
	},
});
