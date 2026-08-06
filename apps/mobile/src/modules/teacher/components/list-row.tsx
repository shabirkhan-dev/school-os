import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBadge, type StatusVariant } from "@/components/ui/status-badge";
import { AppColors } from "@/constants/design-system";
import { IconTile } from "./icon-tile";

interface ListRowProps {
	icon: LucideIcon;
	iconColor?: string;
	iconBackground?: string;
	title: string;
	subtitle?: string | null;
	value?: string | null;
	badge?: { label: string; status: StatusVariant };
	onPress?: () => void;
	last?: boolean;
}

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
			<IconTile icon={icon} color={iconColor} background={iconBackground} size={40} iconSize={19} />
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
			{onPress ? <ChevronRight size={17} color={AppColors.text.muted} strokeWidth={2} /> : null}
		</>
	);

	const containerStyle = [styles.container, !last && styles.divider];

	if (onPress) {
		return (
			<Pressable
				style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
				onPress={onPress}
			>
				{content}
			</Pressable>
		);
	}
	return <View style={containerStyle}>{content}</View>;
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	divider: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: AppColors.card.border,
	},
	pressable: {},
	pressed: {
		opacity: 0.7,
	},
	copy: {
		flex: 1,
		gap: 2,
	},
	title: {
		color: AppColors.text.primary,
		fontSize: 15,
		fontWeight: "600",
	},
	subtitle: {
		color: AppColors.text.secondary,
		fontSize: 12,
		lineHeight: 16,
	},
	value: {
		color: AppColors.text.primary,
		fontSize: 15,
		fontWeight: "700",
		fontVariant: ["tabular-nums"],
	},
});
