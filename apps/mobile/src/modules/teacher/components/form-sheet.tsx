import { X } from "lucide-react-native";
import type * as React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { AppColors, AppShadows } from "@/constants/design-system";

interface FormSheetProps {
	visible: boolean;
	title: string;
	subtitle?: string;
	onClose: () => void;
	onSubmit: () => void;
	submitLabel: string;
	loading?: boolean;
	children: React.ReactNode;
}

export function FormSheet({
	visible,
	title,
	subtitle,
	onClose,
	onSubmit,
	submitLabel,
	loading,
	children,
}: FormSheetProps) {
	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<View style={styles.backdrop}>
				<Pressable style={styles.backdropTouch} onPress={onClose} />
				<SafeAreaView edges={["bottom"]} style={styles.sheet}>
					<View style={styles.grabber} />
					<View style={styles.header}>
						<View style={styles.headerCopy}>
							<Text style={styles.title}>{title}</Text>
							{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
						</View>
						<Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
							<X size={18} color={AppColors.text.secondary} strokeWidth={2.2} />
						</Pressable>
					</View>
					<ScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.body}
						keyboardShouldPersistTaps="handled"
					>
						{children}
					</ScrollView>
					<View style={styles.footer}>
						<Button
							label={submitLabel}
							size="lg"
							loading={loading}
							onPress={onSubmit}
							style={styles.submit}
						/>
					</View>
				</SafeAreaView>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(15, 23, 42, 0.45)",
		justifyContent: "flex-end",
	},
	backdropTouch: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	sheet: {
		backgroundColor: AppColors.background,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: "88%",
		...AppShadows.md,
	},
	grabber: {
		alignSelf: "center",
		width: 40,
		height: 4,
		borderRadius: 2,
		backgroundColor: AppColors.card.border,
		marginTop: 10,
	},
	header: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingTop: 14,
		paddingBottom: 10,
		gap: 12,
	},
	headerCopy: {
		flex: 1,
		gap: 2,
	},
	title: {
		color: AppColors.text.primary,
		fontSize: 19,
		fontWeight: "800",
		letterSpacing: 0,
	},
	subtitle: {
		color: AppColors.text.muted,
		fontSize: 12,
		lineHeight: 17,
	},
	closeButton: {
		width: 32,
		height: 32,
		borderRadius: 10,
		backgroundColor: AppColors.card.subtle,
		alignItems: "center",
		justifyContent: "center",
	},
	body: {
		paddingHorizontal: 20,
		paddingBottom: 12,
		gap: 14,
	},
	footer: {
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 10,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: AppColors.card.border,
	},
	submit: {
		width: "100%",
	},
});
