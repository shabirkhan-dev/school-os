import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppColors } from "@/constants/design-system";

interface SegmentedOption<T extends string> {
	label: string;
	value: T;
}

interface SegmentedProps<T extends string> {
	options: SegmentedOption<T>[];
	value: T;
	onChange: (value: T) => void;
}

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
	return (
		<View style={styles.container}>
			{options.map((option) => {
				const selected = option.value === value;
				return (
					<Pressable
						key={option.value}
						style={({ pressed }) => [
							styles.segment,
							selected && styles.segmentSelected,
							pressed && styles.pressed,
						]}
						onPress={() => onChange(option.value)}
					>
						<Text style={[styles.label, selected && styles.labelSelected]}>{option.label}</Text>
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		backgroundColor: AppColors.card.subtle,
		borderRadius: 12,
		padding: 3,
		gap: 2,
	},
	segment: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 8,
		borderRadius: 9,
	},
	segmentSelected: {
		backgroundColor: AppColors.surface,
		shadowColor: "#0F172A",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 2,
		elevation: 1,
	},
	label: {
		fontSize: 13,
		fontWeight: "600",
		color: AppColors.text.secondary,
	},
	labelSelected: {
		color: AppColors.text.primary,
		fontWeight: "700",
	},
	pressed: {
		opacity: 0.7,
	},
});
