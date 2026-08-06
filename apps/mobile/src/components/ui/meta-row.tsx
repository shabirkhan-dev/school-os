import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Tokens } from "@/constants/design-system";

export interface MetaItem {
	icon?: LucideIcon;
	value: string;
	/** Emphasise a single item, e.g. a count that needs attention. */
	tone?: "default" | "strong" | "warn";
}

interface MetaRowProps {
	items: MetaItem[];
}

/**
 * Compact `icon value · icon value` strip for row metadata.
 *
 * Carries several facts in one line without labels, which keeps list rows to
 * two lines instead of four. Falsy items are dropped so callers can inline
 * conditionals without leaving stray separators behind.
 */
export function MetaRow({ items }: MetaRowProps) {
	const visible = items.filter((item) => Boolean(item.value));
	if (visible.length === 0) return null;

	return (
		<View style={styles.row}>
			{visible.map((item, index) => {
				const Icon = item.icon;
				const color = TONE_COLOR[item.tone ?? "default"];

				return (
					<View key={`${item.value}-${index}`} style={styles.group}>
						{index > 0 ? <Text style={styles.separator}>·</Text> : null}
						{Icon ? <Icon size={13} color={color} strokeWidth={2} /> : null}
						<Text style={[styles.value, { color }]} numberOfLines={1}>
							{item.value}
						</Text>
					</View>
				);
			})}
		</View>
	);
}

const TONE_COLOR = {
	default: Colors.text.tertiary,
	strong: Colors.text.secondary,
	warn: Colors.status.late.fg,
} as const;

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
	},
	group: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["1"],
	},
	separator: {
		color: Colors.text.muted,
		fontSize: Tokens.fontSize.sm,
		marginHorizontal: Tokens.space["1.5"],
	},
	value: {
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.medium,
	},
});
