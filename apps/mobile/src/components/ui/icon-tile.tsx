import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { Colors, Tokens } from "@/constants/design-system";

export type TileTone = "blue" | "green" | "amber" | "purple" | "cyan" | "rose" | "neutral" | "ink";

type TileSize = "sm" | "md" | "lg";

interface IconTileProps {
	icon: LucideIcon;
	tone?: TileTone;
	size?: TileSize;
	style?: ViewStyle;
	/** Explicit override, wins over `tone`. For callers with a computed colour. */
	color?: string;
	/** Explicit override, wins over `tone`. */
	background?: string;
}

/**
 * Tinted rounded-square holding a single icon.
 *
 * The workhorse of scannable lists: colour lets a reader identify a row's
 * category before reading its label. Radius scales with the box so the corner
 * curve looks constant across sizes.
 */
export function IconTile({
	icon: Icon,
	tone = "blue",
	size = "md",
	style,
	color,
	background,
}: IconTileProps) {
	const { box, radius, glyph, stroke } = SIZES[size];
	const palette = TONES[tone];

	return (
		<View
			style={[
				styles.tile,
				{
					width: box,
					height: box,
					borderRadius: radius,
					backgroundColor: background ?? palette.bg,
				},
				style,
			]}
		>
			<Icon size={glyph} color={color ?? palette.fg} strokeWidth={stroke} />
		</View>
	);
}

const SIZES: Record<TileSize, { box: number; radius: number; glyph: number; stroke: number }> = {
	sm: { box: 32, radius: Tokens.radius.sm, glyph: 16, stroke: 2 },
	md: { box: 42, radius: Tokens.radius.md, glyph: 20, stroke: 1.9 },
	lg: { box: 52, radius: Tokens.radius.lg, glyph: 24, stroke: 1.8 },
};

const TONES: Record<TileTone, { fg: string; bg: string }> = {
	blue: Colors.accent.blue,
	green: Colors.accent.green,
	amber: Colors.accent.amber,
	purple: Colors.accent.purple,
	cyan: Colors.accent.cyan,
	rose: Colors.accent.rose,
	neutral: { fg: Colors.text.secondary, bg: Colors.sunken },
	ink: { fg: Colors.ink.foreground, bg: Colors.ink.base },
};

const styles = StyleSheet.create({
	tile: {
		alignItems: "center",
		justifyContent: "center",
	},
});
