import { GraduationCap } from "lucide-react-native";
import type { ReactNode } from "react";
import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NeonCard } from "@/components/ui/neon-card";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";

interface AuthScreenProps {
	brand?: string;
	title: string;
	description: string;
	children?: ReactNode;
	footer?: ReactNode;
	busy?: boolean;
}

export function AuthScreen({
	brand = "School OS",
	title,
	description,
	children,
	footer,
	busy = false,
}: AuthScreenProps) {
	if (busy) {
		return (
			<SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
				<View style={styles.loading}>
					<View style={styles.loadingMark}>
						<GraduationCap color={Colors.ink.foreground} size={26} strokeWidth={2.2} />
					</View>
					<ActivityIndicator color={Colors.brand.base} size="small" />
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
			<KeyboardAvoidingView
				style={styles.flex}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView
					contentContainerStyle={styles.scroll}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<NeonCard style={styles.card}>
						<View style={styles.brandRow}>
							<View style={styles.brandMark}>
								<GraduationCap color={Colors.ink.foreground} size={24} strokeWidth={2.2} />
							</View>
							<View style={styles.brandCopy}>
								<Text style={styles.brand}>{brand}</Text>
								<Text style={styles.brandDetail}>Secure school workspace</Text>
							</View>
						</View>
						<View style={styles.heading}>
							<Text style={styles.title}>{title}</Text>
							<Text style={styles.description}>{description}</Text>
						</View>
						<View style={styles.content}>{children}</View>
					</NeonCard>
					{footer ? <View style={styles.footer}>{footer}</View> : null}
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: {
		flex: 1,
		backgroundColor: Colors.canvas,
	},
	flex: {
		flex: 1,
	},
	scroll: {
		flexGrow: 1,
		justifyContent: "center",
		paddingHorizontal: Tokens.space["5"],
		paddingVertical: Tokens.space["8"],
	},
	card: {
		width: "100%",
		maxWidth: 440,
		alignSelf: "center",
		padding: Tokens.space["6"],
		...Elevation.floating,
	},
	brandRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		marginBottom: Tokens.space["7"],
	},
	brandMark: {
		width: 48,
		height: 48,
		borderRadius: Tokens.radius.md,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.ink.base,
		...Elevation.raisedDark,
	},
	brandCopy: {
		flex: 1,
		gap: Tokens.space["0.5"],
	},
	brand: {
		...Type.subheading,
	},
	brandDetail: {
		...Type.caption,
	},
	heading: {
		gap: Tokens.space["2"],
		marginBottom: Tokens.space["6"],
	},
	title: {
		...Type.title,
	},
	description: {
		...Type.body,
	},
	content: {
		gap: Tokens.space["4"],
	},
	footer: {
		marginTop: Tokens.space["5"],
		alignItems: "center",
	},
	loading: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		gap: Tokens.space["4"],
	},
	loadingMark: {
		width: 56,
		height: 56,
		borderRadius: Tokens.radius.lg,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.ink.base,
		...Elevation.floating,
	},
});
