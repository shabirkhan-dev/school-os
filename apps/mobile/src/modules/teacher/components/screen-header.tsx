import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AppColors } from "@/constants/design-system";

interface ScreenHeaderProps {
	title: string;
	subtitle?: string;
	right?: React.ReactNode;
	backHref?: string;
}

export function ScreenHeader({ title, subtitle, right, backHref }: ScreenHeaderProps) {
	const goBack = () => {
		if (backHref) {
			router.replace(backHref as never);
		} else if (router.canGoBack()) {
			router.back();
		} else {
			router.replace("/(modules)/(dashboard)");
		}
	};

	return (
		<View style={styles.container}>
			<Pressable
				style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
				onPress={goBack}
				hitSlop={8}
			>
				<ChevronLeft size={22} color={AppColors.text.primary} strokeWidth={2.2} />
			</Pressable>
			<View style={styles.copy}>
				<Text style={styles.title} numberOfLines={1}>
					{title}
				</Text>
				{subtitle ? (
					<Text style={styles.subtitle} numberOfLines={1}>
						{subtitle}
					</Text>
				) : null}
			</View>
			{right ? <View style={styles.right}>{right}</View> : <View style={styles.rightSpacer} />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	backButton: {
		width: 38,
		height: 38,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.card.subtle,
		borderWidth: 1,
		borderColor: AppColors.card.border,
	},
	pressed: {
		opacity: 0.7,
		transform: [{ scale: 0.96 }],
	},
	copy: {
		flex: 1,
		gap: 1,
	},
	title: {
		color: AppColors.text.primary,
		fontSize: 19,
		fontWeight: "800",
		letterSpacing: -0.3,
	},
	subtitle: {
		color: AppColors.text.muted,
		fontSize: 12,
	},
	right: {
		flexDirection: "row",
		alignItems: "center",
	},
	rightSpacer: {
		width: 38,
	},
});
