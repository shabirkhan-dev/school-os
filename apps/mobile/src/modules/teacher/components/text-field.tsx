import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";

interface TextFieldProps extends TextInputProps {
	label: string;
	error?: string | null;
}

export function TextField({ label, error, style, ...props }: TextFieldProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.label}>{label}</Text>
			<TextInput
				style={[styles.input, error ? styles.inputError : null, style]}
				placeholderTextColor={AppColors.text.muted}
				{...props}
			/>
			{error ? <Text style={styles.error}>{error}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 6,
	},
	label: {
		...Type.meta,
		color: Colors.text.primary,
		fontWeight: Tokens.fontWeight.semibold,
	},
	input: {
		backgroundColor: Colors.sunken,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
		borderRadius: Tokens.radius.md,
		paddingHorizontal: Tokens.space["3"],
		paddingVertical: Tokens.space["3"],
		color: Colors.text.primary,
		fontSize: Tokens.fontSize.lg,
		minHeight: Tokens.touchTarget,
		...Elevation.well,
	},
	inputError: {
		borderColor: Colors.status.absent.border,
	},
	error: {
		color: Colors.status.absent.fg,
		fontSize: Tokens.fontSize.sm,
	},
});
