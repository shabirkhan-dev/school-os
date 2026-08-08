import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";

interface AuthFieldProps {
	label: string;
	value: string;
	onChangeText: (value: string) => void;
	placeholder?: string;
	secureTextEntry?: boolean;
	showPasswordToggle?: boolean;
	onTogglePassword?: () => void;
	keyboardType?: "default" | "email-address" | "number-pad";
	autoComplete?: TextInputProps["autoComplete"];
	autoCapitalize?: "none" | "sentences" | "words" | "characters";
	editable?: boolean;
	hint?: string;
	errorHint?: string;
	maxLength?: number;
	multiline?: boolean;
	numberOfLines?: number;
	rightLink?: { label: string; onPress: () => void };
	icon?: LucideIcon;
	returnKeyType?: TextInputProps["returnKeyType"];
	onSubmitEditing?: TextInputProps["onSubmitEditing"];
}

export function AuthField({
	label,
	value,
	onChangeText,
	placeholder,
	secureTextEntry,
	showPasswordToggle,
	onTogglePassword,
	keyboardType = "default",
	autoComplete,
	autoCapitalize = "none",
	editable = true,
	hint,
	errorHint,
	maxLength,
	multiline = false,
	numberOfLines,
	rightLink,
	icon: Icon,
	returnKeyType,
	onSubmitEditing,
}: AuthFieldProps) {
	const [focused, setFocused] = useState(false);

	return (
		<View style={styles.field}>
			<View style={styles.labelRow}>
				<Text style={styles.label}>{label}</Text>
				{rightLink ? (
					<Pressable onPress={rightLink.onPress} hitSlop={8}>
						<Text style={styles.link}>{rightLink.label}</Text>
					</Pressable>
				) : null}
			</View>
			<View
				style={[
					styles.inputWrap,
					focused && styles.inputWrapFocused,
					errorHint && styles.inputWrapError,
					!editable && styles.inputWrapDisabled,
					multiline && styles.inputWrapMultiline,
				]}
			>
				{Icon ? (
					<View style={[styles.leadingIcon, focused && styles.leadingIconFocused]}>
						<Icon
							size={17}
							strokeWidth={2}
							color={
								errorHint
									? Colors.status.absent.fg
									: focused
										? Colors.brand.base
										: Colors.text.tertiary
							}
						/>
					</View>
				) : null}
				<TextInput
					style={[styles.input, multiline && styles.inputMultiline]}
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={Colors.text.muted}
					secureTextEntry={secureTextEntry}
					keyboardType={keyboardType}
					autoComplete={autoComplete}
					autoCapitalize={autoCapitalize}
					editable={editable}
					maxLength={maxLength}
					multiline={multiline}
					numberOfLines={numberOfLines}
					textAlignVertical={multiline ? "top" : "center"}
					returnKeyType={returnKeyType}
					onSubmitEditing={onSubmitEditing}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
				/>
				{showPasswordToggle ? (
					<Pressable
						onPress={onTogglePassword}
						hitSlop={4}
						style={({ pressed }) => [styles.eye, pressed && styles.eyePressed]}
						accessibilityRole="button"
						accessibilityLabel={secureTextEntry ? "Show password" : "Hide password"}
					>
						{secureTextEntry ? (
							<Eye size={18} color={Colors.text.secondary} />
						) : (
							<EyeOff size={18} color={Colors.text.secondary} />
						)}
					</Pressable>
				) : null}
			</View>
			{errorHint ? <Text style={styles.errorHint}>{errorHint}</Text> : null}
			{!errorHint && hint ? <Text style={styles.hint}>{hint}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	field: {
		gap: Tokens.space["2"],
	},
	labelRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	label: {
		...Type.meta,
		color: Colors.text.primary,
		fontWeight: Tokens.fontWeight.semibold,
	},
	link: {
		...Type.caption,
		color: Colors.brand.base,
		fontWeight: Tokens.fontWeight.semibold,
	},
	inputWrap: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.subtle,
		borderRadius: Tokens.radius.md,
		backgroundColor: Colors.sunken,
		paddingHorizontal: Tokens.space["2.5"],
		minHeight: 52,
		...Elevation.well,
	},
	inputWrapFocused: {
		borderColor: Colors.brand.border,
		backgroundColor: Colors.surfaceBright,
		...Elevation.raised,
	},
	inputWrapError: {
		borderColor: Colors.status.absent.border,
	},
	inputWrapDisabled: {
		opacity: 0.55,
	},
	inputWrapMultiline: {
		alignItems: "flex-start",
		minHeight: 112,
		paddingVertical: 4,
	},
	input: {
		flex: 1,
		color: Colors.text.primary,
		fontSize: Tokens.fontSize.lg,
		paddingHorizontal: Tokens.space["2.5"],
		paddingVertical: Tokens.space["3"],
	},
	inputMultiline: {
		minHeight: 96,
		paddingTop: 12,
	},
	leadingIcon: {
		width: 32,
		height: 32,
		borderRadius: Tokens.radius.sm,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.surface,
	},
	leadingIconFocused: {
		backgroundColor: Colors.brand.tint,
	},
	eye: {
		width: Tokens.touchTarget,
		height: Tokens.touchTarget,
		borderRadius: Tokens.radius.sm,
		alignItems: "center",
		justifyContent: "center",
	},
	eyePressed: {
		backgroundColor: Colors.border.subtle,
	},
	hint: {
		...Type.caption,
	},
	errorHint: {
		...Type.caption,
		color: Colors.status.absent.fg,
	},
});
