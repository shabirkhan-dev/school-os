"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useAtlasTheme } from "../lib/theme";
import { cn } from "../lib/utils";

/**
 * Institutional green + warm cream plates — calm school-network aesthetic.
 */
const PALETTES_LIGHT = {
	blue: ["#eef8f2", "#c8ead8", "#8fd4b0", "#3cb882", "#0a6847", "#d4efe3"],
	teal: ["#e8f6f2", "#b8e8dc", "#6ecfb8", "#2aab8f", "#0d7a66", "#a8e8d8"],
	lime: ["#f2f9ec", "#d9efc4", "#a8d978", "#5cb85c", "#2d8a4e", "#b8e6a8"],
	amber: ["#faf6eb", "#f0e4c4", "#e0c878", "#c4a035", "#9a7b1a", "#f5e6b8"],
} as const;

const PALETTES_DARK = {
	blue: ["#0a1210", "#0f1f1a", "#143528", "#1a4a38", "#0d7a55", "#121916"],
	teal: ["#0a1211", "#102220", "#153530", "#1a4540", "#0f6b58", "#101816"],
	lime: ["#0c1210", "#152218", "#1a3328", "#224838", "#2d8a4e", "#121916"],
	amber: ["#12100a", "#1a1810", "#252018", "#3a3020", "#9a7b1a", "#121916"],
} as const;

/** Mid-tone foil rims for Why cards */
export const WHY_RIM_COLORS = {
	blue: ["#2d9b6f", "#3cb882", "#6ecfb8", "#0a6847", "#5fd4a0", "#8fd4b0"],
	lime: ["#2d8a4e", "#5cb85c", "#8fd4a0", "#0a6847", "#6ecfb8", "#3cb882"],
	amber: ["#c4a035", "#d4b04a", "#e8cc78", "#b8922a", "#f0dfa0", "#e0c878"],
} as const;

export const WHY_RIM_COLORS_DARK = {
	blue: ["#1a4a38", "#2d9b6f", "#3cb882", "#0d7a55", "#5fd4a0", "#143528"],
	lime: ["#224838", "#2d8a4e", "#3cb882", "#0d7a55", "#5fd4a0", "#1a3328"],
	amber: ["#3a3020", "#9a7b1a", "#c4a035", "#6b5512", "#d4b04a", "#252018"],
} as const;

export type MeshPalette = keyof typeof PALETTES_LIGHT;

type MeshCanvasProps = {
	className?: string;
	/** 0–1 grain amount. Kept low — grainOverlay darkens the plate. */
	intensity?: number;
	palette?: MeshPalette;
	/** Override palette stops (e.g. Why rim foil). */
	colors?: readonly string[];
	speed?: number;
};

const FALLBACK_LIGHT: Record<MeshPalette, string> = {
	lime: "bg-[#b8e6a8]",
	teal: "bg-[#8fd4b0]",
	amber: "bg-[#e0c878]",
	blue: "bg-[#8fd4b0]",
};

const FALLBACK_DARK: Record<MeshPalette, string> = {
	lime: "bg-[#121916]",
	teal: "bg-[#101816]",
	amber: "bg-[#121916]",
	blue: "bg-[#121916]",
};

/**
 * WebGL mesh-gradient shader (Paper Design) — soft grainy color plate
 * used behind product mockups and capability card previews.
 */
export function MeshCanvas({
	className,
	intensity = 0.28,
	palette = "blue",
	colors: colorsProp,
	speed = 0.28,
}: MeshCanvasProps) {
	const { theme } = useAtlasTheme();
	const isDark = theme === "dark";
	const t = Math.min(1, Math.max(0, intensity));
	const paletteSet = isDark ? PALETTES_DARK : PALETTES_LIGHT;
	const colors = [...(colorsProp ?? paletteSet[palette])];
	const fallback = isDark ? FALLBACK_DARK[palette] : FALLBACK_LIGHT[palette];

	return (
		<div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
			<div className={cn("absolute inset-0", fallback)} aria-hidden />
			<MeshGradient
				colors={colors}
				distortion={0.78}
				swirl={0.18}
				grainMixer={0.35 + t * 0.25}
				grainOverlay={0.08 + t * 0.12}
				speed={speed}
				scale={1.12}
				style={{
					position: "absolute",
					inset: 0,
					width: "100%",
					height: "100%",
				}}
			/>
		</div>
	);
}
