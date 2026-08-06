import { StyleSheet, Text, TextInput, type TextInputProps, View } from "react-native";
import { AppColors } from "@/constants/design-system";

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
		color: AppColors.text.secondary,
		fontSize: 13,
		fontWeight: "600",
	},
	input: {
		backgroundColor: AppColors.surface,
		borderWidth: 1,
		borderColor: AppColors.card.border,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: AppColors.text.primary,
		fontSize: 15,
	},
	inputError: {
		borderColor: AppColors.status.absent,
	},
	error: {
		color: AppColors.status.absent,
		fontSize: 12,
	},
});
