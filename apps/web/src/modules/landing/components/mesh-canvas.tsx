"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { cn } from "../lib/utils";

/**
 * Institutional green + warm cream plates — calm school-network aesthetic.
 */
const PALETTES = {
	blue: ["#eef8f2", "#c8ead8", "#8fd4b0", "#3cb882", "#0a6847", "#d4efe3"],
	teal: ["#e8f6f2", "#b8e8dc", "#6ecfb8", "#2aab8f", "#0d7a66", "#a8e8d8"],
	lime: ["#f2f9ec", "#d9efc4", "#a8d978", "#5cb85c", "#2d8a4e", "#b8e6a8"],
	amber: ["#faf6eb", "#f0e4c4", "#e0c878", "#c4a035", "#9a7b1a", "#f5e6b8"],
} as const;

/** Mid-tone foil rims for Why cards */
export const WHY_RIM_COLORS = {
	blue: ["#2d9b6f", "#3cb882", "#6ecfb8", "#0a6847", "#5fd4a0", "#8fd4b0"],
	lime: ["#2d8a4e", "#5cb85c", "#8fd4a0", "#0a6847", "#6ecfb8", "#3cb882"],
	amber: ["#c4a035", "#d4b04a", "#e8cc78", "#b8922a", "#f0dfa0", "#e0c878"],
} as const;

export type MeshPalette = keyof typeof PALETTES;

type MeshCanvasProps = {
	className?: string;
	/** 0–1 grain amount. Kept low — grainOverlay darkens the plate. */
	intensity?: number;
	palette?: MeshPalette;
	/** Override palette stops (e.g. Why rim foil). */
	colors?: readonly string[];
	speed?: number;
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
	const t = Math.min(1, Math.max(0, intensity));
	const colors = [...(colorsProp ?? PALETTES[palette])];
	const fallback =
		palette === "lime"
			? "bg-[#b8e6a8]"
			: palette === "teal"
				? "bg-[#8fd4b0]"
				: palette === "amber"
					? "bg-[#e0c878]"
					: "bg-[#8fd4b0]";

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
