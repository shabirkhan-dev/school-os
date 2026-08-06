import { StyleSheet, Text, View } from "react-native";
import { Colors, Tokens } from "@/constants/design-system";

export type StatusVariant =
	| "present"
	| "absent"
	| "late"
	| "excused"
	| "pending"
	| "published"
	| "draft"
	| "brand";

interface StatusBadgeProps {
	label: string;
	status?: StatusVariant;
	size?: "sm" | "md";
}

/**
 * Status pill: tinted background, matching dot, matching text.
 *
 * The dot carries the signal for anyone who cannot separate the tint from the
 * surface, so the badge never relies on background colour alone.
 */
export function StatusBadge({ label, status = "pending", size = "md" }: StatusBadgeProps) {
	const variant = VARIANTS[status];
	const small = size === "sm";

	return (
		<View
			style={[styles.container, small ? styles.sm : styles.md, { backgroundColor: variant.bg }]}
		>
			<View style={[styles.dot, { backgroundColor: variant.fg }]} />
			<Text style={[small ? styles.textSm : styles.textMd, { color: variant.fg }]}>{label}</Text>
		</View>
	);
}

const brandPill = {
	fg: Colors.brand.strong,
	bg: Colors.brand.tint,
	border: Colors.brand.border,
};

const VARIANTS: Record<StatusVariant, { fg: string; bg: string; border: string }> = {
	present: Colors.status.present,
	absent: Colors.status.absent,
	late: Colors.status.late,
	excused: Colors.status.excused,
	pending: Colors.status.pending,
	draft: Colors.status.pending,
	published: brandPill,
	brand: brandPill,
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: Tokens.radius.full,
		alignSelf: "flex-start",
	},
	sm: {
		paddingHorizontal: Tokens.space["2"],
		paddingVertical: Tokens.space["1"],
		gap: Tokens.space["1.5"],
	},
	md: {
		paddingHorizontal: Tokens.space["2.5"],
		paddingVertical: Tokens.space["1.5"],
		gap: Tokens.space["1.5"],
	},
	dot: {
		width: 5,
		height: 5,
		borderRadius: Tokens.radius.full,
	},
	textSm: {
		fontSize: Tokens.fontSize.xs,
		fontWeight: Tokens.fontWeight.semibold,
		letterSpacing: Tokens.tracking.snug,
	},
	textMd: {
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.semibold,
		letterSpacing: Tokens.tracking.snug,
	},
});
