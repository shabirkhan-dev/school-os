import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { IconTile } from "@/components/ui/icon-tile";
import { PressableScale } from "@/components/ui/pressable-scale";
import { StatusBadge, type StatusVariant } from "@/components/ui/status-badge";
import { Colors, Tokens } from "@/constants/design-system";

interface ListRowProps {
	icon: LucideIcon;
	/** Explicit colour overrides for callers with dynamic colours. */
	iconColor?: string;
	iconBackground?: string;
	title: string;
	subtitle?: string | null;
	value?: string | null;
	badge?: { label: string; status: StatusVariant };
	onPress?: () => void;
	/** Last in a group card, omit divider. */
	last?: boolean;
}

/**
 * General-purpose list row. Icon tile, flex copy, optional badge or value, chevron.
 *
 * Renders inside a group card (no border, internal dividers) or standalone with
 * shadow. The two modes are visually identical so screens can upgrade from
 * one to the other without re-learning.
 */
export function ListRow({
	icon,
	iconColor,
	iconBackground,
	title,
	subtitle,
	value,
	badge,
	onPress,
	last,
}: ListRowProps) {
	const content = (
		<>
			<IconTile icon={icon} color={iconColor} background={iconBackground} size="md" />
			<View style={styles.copy}>
				<Text style={styles.title} numberOfLines={1}>
					{title}
				</Text>
				{subtitle ? (
					<Text style={styles.subtitle} numberOfLines={2}>
						{subtitle}
					</Text>
				) : null}
			</View>
			{badge ? <StatusBadge label={badge.label} status={badge.status} size="sm" /> : null}
			{value ? <Text style={styles.value}>{value}</Text> : null}
			{onPress ? <ChevronRight size={16} color={Colors.text.muted} strokeWidth={2.2} /> : null}
		</>
	);

	const rowStyle = [styles.row, !last && styles.divider];

	if (onPress) {
		return (
			<PressableScale style={rowStyle} onPress={onPress} scaleTo={0.985} dim={false}>
				{content}
			</PressableScale>
		);
	}
	return <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		paddingVertical: Tokens.space["3"],
		paddingHorizontal: Tokens.space["4"],
	},
	divider: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: Colors.border.base,
	},
	copy: {
		flex: 1,
		gap: Tokens.space["1"],
	},
	title: {
		fontSize: Tokens.fontSize.lg,
		fontWeight: Tokens.fontWeight.semibold,
		color: Colors.text.primary,
		letterSpacing: Tokens.tracking.snug,
	},
	subtitle: {
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.medium,
		color: Colors.text.secondary,
		lineHeight: Tokens.fontSize.sm * Tokens.leading.normal,
	},
	value: {
		fontSize: Tokens.fontSize.lg,
		fontWeight: Tokens.fontWeight.bold,
		color: Colors.text.primary,
		fontVariant: ["tabular-nums"],
	},
});
