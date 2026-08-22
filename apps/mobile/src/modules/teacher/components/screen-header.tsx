import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import type * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Tokens } from "@/constants/design-system";

interface ScreenHeaderProps {
	title: string;
	subtitle?: string;
	right?: React.ReactNode;
	/** Explicit destination, for screens reachable from more than one place. */
	backHref?: string;
}

/** Back affordance, title block, optional trailing slot. Used by every detail screen. */
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
			<PressableScale
				style={styles.backButton}
				scaleTo={0.9}
				onPress={goBack}
				hitSlop={8}
				accessibilityRole="button"
				accessibilityLabel="Go back"
			>
				<ChevronLeft size={20} color={Colors.text.primary} strokeWidth={2.3} />
			</PressableScale>

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

			{right ? <View style={styles.right}>{right}</View> : <View style={styles.spacer} />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		paddingHorizontal: Tokens.space["4"],
		paddingVertical: Tokens.space["3"],
	},
	backButton: {
		width: Tokens.touchTarget,
		height: Tokens.touchTarget,
		borderRadius: Tokens.radius.full,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.surfaceBright,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
	},
	copy: {
		flex: 1,
	},
	title: {
		fontSize: Tokens.fontSize["2xl"],
		fontWeight: Tokens.fontWeight.bold,
		color: Colors.text.primary,
		letterSpacing: Tokens.tracking.tight,
	},
	subtitle: {
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.medium,
		color: Colors.text.tertiary,
		marginTop: 1,
	},
	right: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["2"],
	},
	spacer: {
		width: Tokens.touchTarget,
	},
});
