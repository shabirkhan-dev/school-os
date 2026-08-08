import type { TextStyle, ViewStyle } from "react-native";
import { Tokens } from "./tokens";

/**
 * Palette.
 *
 * Neutrals carry a slight warm cast rather than the usual blue-grey. It is the
 * cheapest way to stop the UI reading as a stock template, and it is easier to
 * look at across a full teaching day.
 *
 * Depth comes from shadow, not outlines. Borders are reserved for cases where
 * two surfaces of the same elevation genuinely need separating.
 */

export const Colors = {
	/** Page background — never white, so raised surfaces have something to sit on. */
	canvas: "#F4F2EF",

	/**
	 * Raised surface. A hair off pure white on purpose: the inset top-edge
	 * highlight in `Elevation` needs somewhere brighter to go, and #FFF leaves
	 * it nowhere. The difference is invisible on its own and does real work
	 * once the surface is lit.
	 */
	surface: "#FCFBFA",

	/** Surface for content that should read brighter than its container. */
	surfaceBright: "#FFFFFF",

	/** Recessed surface. Pair with `Elevation.well`, never as a flat fill alone. */
	sunken: "#EAE7E1",

	/**
	 * Near-invisible by design. If a border is doing visible work, the element
	 * probably needs elevation instead.
	 */
	border: {
		subtle: "#EFEDE9",
		base: "#E5E2DC",
		strong: "#D6D2CA",
	},

	/** Warm near-black rather than pure black — pure black vibrates against warm neutrals. */
	text: {
		primary: "#1C1A17",
		secondary: "#6B675F",
		tertiary: "#969188",
		muted: "#B4AFA5",
		inverse: "#FFFFFF",
	},

	/** Primary action. Charcoal reads as more considered than a saturated brand fill. */
	ink: {
		base: "#1C1A17",
		hover: "#312D28",
		foreground: "#FFFFFF",
	},

	/** Brand accent — links, active nav, focus rings, selected state. */
	brand: {
		tint: "#EBF1FE",
		border: "#D3E0FC",
		base: "#2563EB",
		strong: "#1D4ED8",
	},

	/**
	 * Semantic families. Every entry is a full set so a status can render as a
	 * tinted tile, a pill, and a solid fill without hunting for a matching shade.
	 */
	status: {
		present: { fg: "#15803D", bg: "#E8F6EC", border: "#C6E9D1", solid: "#16A34A" },
		absent: { fg: "#B91C1C", bg: "#FDECEC", border: "#F8D4D4", solid: "#DC2626" },
		late: { fg: "#B45309", bg: "#FDF3E3", border: "#F7E3BE", solid: "#D97706" },
		excused: { fg: "#1D4ED8", bg: "#EBF1FE", border: "#D3E0FC", solid: "#2563EB" },
		pending: { fg: "#6B675F", bg: "#F1EFEB", border: "#E5E2DC", solid: "#8B867C" },
	},

	/** Categorical accents for icon tiles. Ordered for adjacent-hue distinction. */
	accent: {
		blue: { fg: "#2563EB", bg: "#EBF1FE", border: "#D3E0FC" },
		green: { fg: "#16A34A", bg: "#E8F6EC", border: "#C6E9D1" },
		amber: { fg: "#D97706", bg: "#FDF3E3", border: "#F7E3BE" },
		purple: { fg: "#7C3AED", bg: "#F3ECFE", border: "#E4D5FC" },
		cyan: { fg: "#0891B2", bg: "#E4F4F9", border: "#C2E7F0" },
		rose: { fg: "#E11D48", bg: "#FDEBEF", border: "#FAD1DB" },
	},
} as const;

/**
 * Elevation.
 *
 * Every level is a *stack* of shadows, because a single shadow reads as a
 * sticker rather than an object. Real depth needs at least two layers:
 *
 *   contact — tight, slightly darker, sits right under the edge. Tells the eye
 *             where the object actually meets the surface below it.
 *   ambient — wide, very light, negative spread. The soft falloff a diffuse
 *             room light produces.
 *
 * Raised levels also carry an inset white line along the top edge. That is the
 * light catching the top bevel, and it is the single detail that separates a
 * surface that looks *printed on* the page from one that looks *placed on* it.
 *
 * Levels are deliberately far apart. If two elevations are hard to tell apart
 * they should be the same level.
 */

/** Warm shadow tint. Pure black against warm neutrals reads as dirty grey. */
const UMBRA = "46, 42, 36";
const shade = (alpha: number) => `rgba(${UMBRA}, ${alpha})`;
/** Top-edge catch light. Slightly transparent so it warms rather than blows out. */
const SHEEN = "rgba(255, 255, 255, 0.75)";

export const Elevation = {
	/** Flat on the canvas. No shadow — use when a border or fill does the work. */
	flush: {},

	/** Default resting card. Present but quiet. */
	raised: {
		boxShadow: [
			{ offsetX: 0, offsetY: 1, blurRadius: 0, color: SHEEN, inset: true },
			{ offsetX: 0, offsetY: 1, blurRadius: 2, color: shade(0.06) },
			{ offsetX: 0, offsetY: 3, blurRadius: 8, spreadDistance: -1, color: shade(0.05) },
		],
	},

	/** Interactive rows and grouped panels. Clearly above `raised`. */
	lifted: {
		boxShadow: [
			{ offsetX: 0, offsetY: 1, blurRadius: 0, color: SHEEN, inset: true },
			{ offsetX: 0, offsetY: 2, blurRadius: 4, color: shade(0.07) },
			{ offsetX: 0, offsetY: 6, blurRadius: 16, spreadDistance: -2, color: shade(0.07) },
		],
	},

	/** The one hero card on a screen. */
	floating: {
		boxShadow: [
			{ offsetX: 0, offsetY: 1, blurRadius: 0, color: SHEEN, inset: true },
			{ offsetX: 0, offsetY: 3, blurRadius: 6, color: shade(0.08) },
			{ offsetX: 0, offsetY: 12, blurRadius: 28, spreadDistance: -6, color: shade(0.12) },
		],
	},

	/** Chrome that floats over scrolling content: tab bar, FAB. */
	overlay: {
		boxShadow: [
			{ offsetX: 0, offsetY: 1, blurRadius: 0, color: SHEEN, inset: true },
			{ offsetX: 0, offsetY: 4, blurRadius: 10, color: shade(0.07) },
			{ offsetX: 0, offsetY: 16, blurRadius: 40, spreadDistance: -10, color: shade(0.16) },
		],
	},

	/** Modals and action sheets. */
	modal: {
		boxShadow: [
			{ offsetX: 0, offsetY: 2, blurRadius: 0, color: SHEEN, inset: true },
			{ offsetX: 0, offsetY: 8, blurRadius: 16, color: shade(0.1) },
			{ offsetX: 0, offsetY: 24, blurRadius: 56, spreadDistance: -12, color: shade(0.2) },
		],
	},

	/**
	 * Recessed — the surface sits *below* the page. Pair with `Colors.sunken`.
	 * For progress tracks, segmented backgrounds, input wells, chart areas.
	 */
	well: {
		boxShadow: [
			{ offsetX: 0, offsetY: 1, blurRadius: 2, color: shade(0.09), inset: true },
			{
				offsetX: 0,
				offsetY: 2,
				blurRadius: 5,
				spreadDistance: -1,
				color: shade(0.06),
				inset: true,
			},
		],
	},

	/** Deeper recess for larger wells where a shallow inset would vanish. */
	wellDeep: {
		boxShadow: [
			{ offsetX: 0, offsetY: 2, blurRadius: 4, color: shade(0.12), inset: true },
			{
				offsetX: 0,
				offsetY: 4,
				blurRadius: 10,
				spreadDistance: -2,
				color: shade(0.08),
				inset: true,
			},
		],
	},

	/**
	 * For dark surfaces. The standard sheen is invisible on charcoal, so the
	 * highlight is brighter and the cast shadow is deeper to hold separation.
	 */
	raisedDark: {
		boxShadow: [
			{ offsetX: 0, offsetY: 1, blurRadius: 0, color: "rgba(255,255,255,0.14)", inset: true },
			{ offsetX: 0, offsetY: 4, blurRadius: 10, color: shade(0.18) },
			{ offsetX: 0, offsetY: 14, blurRadius: 32, spreadDistance: -6, color: shade(0.22) },
		],
	},
} satisfies Record<string, ViewStyle>;

/**
 * Legacy names. Kept so unmigrated screens keep compiling; they now resolve to
 * the layered stacks above rather than the old single flat shadow.
 */
export const Shadows = {
	xs: Elevation.raised,
	sm: Elevation.lifted,
	md: Elevation.floating,
	lg: Elevation.overlay,
	xl: Elevation.modal,
} satisfies Record<string, ViewStyle>;

/**
 * Text presets. Compose size, weight, tracking and leading together so the
 * same role looks identical everywhere instead of being reassembled per screen.
 */
export const Type = {
	/** Screen greeting. One per screen. */
	display: {
		fontSize: Tokens.fontSize["6xl"],
		fontWeight: Tokens.fontWeight.bold,
		letterSpacing: Tokens.tracking.tighter,
		lineHeight: Tokens.fontSize["6xl"] * Tokens.leading.tight,
		color: Colors.text.primary,
	},
	title: {
		fontSize: Tokens.fontSize["4xl"],
		fontWeight: Tokens.fontWeight.bold,
		letterSpacing: Tokens.tracking.tight,
		lineHeight: Tokens.fontSize["4xl"] * Tokens.leading.tight,
		color: Colors.text.primary,
	},
	/** Section heading. */
	heading: {
		fontSize: Tokens.fontSize["2xl"],
		fontWeight: Tokens.fontWeight.bold,
		letterSpacing: Tokens.tracking.snug,
		lineHeight: Tokens.fontSize["2xl"] * Tokens.leading.snug,
		color: Colors.text.primary,
	},
	/** Card and row titles. */
	subheading: {
		fontSize: Tokens.fontSize.xl,
		fontWeight: Tokens.fontWeight.semibold,
		letterSpacing: Tokens.tracking.snug,
		lineHeight: Tokens.fontSize.xl * Tokens.leading.snug,
		color: Colors.text.primary,
	},
	body: {
		fontSize: Tokens.fontSize.md,
		fontWeight: Tokens.fontWeight.regular,
		lineHeight: Tokens.fontSize.md * Tokens.leading.normal,
		color: Colors.text.secondary,
	},
	/** Supporting text under a title. */
	meta: {
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.medium,
		lineHeight: Tokens.fontSize.base * Tokens.leading.normal,
		color: Colors.text.secondary,
	},
	caption: {
		fontSize: Tokens.fontSize.sm,
		fontWeight: Tokens.fontWeight.medium,
		lineHeight: Tokens.fontSize.sm * Tokens.leading.normal,
		color: Colors.text.tertiary,
	},
	/** Small caps group label, e.g. "ACCOUNT SETTINGS". */
	overline: {
		fontSize: Tokens.fontSize.xs,
		fontWeight: Tokens.fontWeight.bold,
		letterSpacing: Tokens.tracking.widest,
		textTransform: "uppercase",
		color: Colors.text.tertiary,
	},
	/** Large figures. Tabular so digits do not jitter as values update. */
	metric: {
		fontSize: Tokens.fontSize["5xl"],
		fontWeight: Tokens.fontWeight.bold,
		letterSpacing: Tokens.tracking.tight,
		fontVariant: ["tabular-nums"],
		color: Colors.text.primary,
	},
	metricSm: {
		fontSize: Tokens.fontSize["4xl"],
		fontWeight: Tokens.fontWeight.bold,
		letterSpacing: Tokens.tracking.tight,
		fontVariant: ["tabular-nums"],
		color: Colors.text.primary,
	},
} satisfies Record<string, TextStyle>;

export { Tokens };

/* -------------------------------------------------------------------------- */
/* Compatibility layer                                                        */
/*                                                                            */
/* Screens not yet migrated import these names. Mapping them onto the new      */
/* palette means those screens pick up the warm neutrals without edits.        */
/* Prefer `Colors` / `Shadows` / `Type` in new code.                           */
/* -------------------------------------------------------------------------- */

export const AppColors = {
	background: Colors.canvas,
	surface: Colors.surface,
	card: {
		background: Colors.surface,
		border: Colors.border.base,
		subtle: Colors.sunken,
	},
	text: {
		primary: Colors.text.primary,
		secondary: Colors.text.secondary,
		muted: Colors.text.muted,
		inverse: Colors.text.inverse,
	},
	primary: {
		main: Colors.ink.base,
		foreground: Colors.ink.foreground,
		brand: Colors.brand.base,
		subtle: Colors.brand.tint,
	},
	status: {
		present: Colors.status.present.solid,
		presentBg: Colors.status.present.bg,
		absent: Colors.status.absent.solid,
		absentBg: Colors.status.absent.bg,
		late: Colors.status.late.solid,
		lateBg: Colors.status.late.bg,
		excused: Colors.status.excused.solid,
		excusedBg: Colors.status.excused.bg,
		pending: Colors.status.pending.solid,
		pendingBg: Colors.status.pending.bg,
	},
	accent: {
		blue: Colors.accent.blue.fg,
		green: Colors.accent.green.fg,
		amber: Colors.accent.amber.fg,
		red: Colors.status.absent.solid,
		purple: Colors.accent.purple.fg,
		cyan: Colors.accent.cyan.fg,
		gray: Colors.text.secondary,
	},
} as const;

export const AppShadows = {
	sm: Shadows.xs,
	md: Shadows.sm,
} as const;

export const NeonColors = {
	background: Colors.canvas,
	surface: Colors.surface,
	card: {
		gradient: [Colors.surface, Colors.sunken] as const,
		border: Colors.border.base,
	},
	text: {
		primary: Colors.text.primary,
		secondary: Colors.text.secondary,
		muted: Colors.text.muted,
	},
	accent: {
		green: Colors.accent.green.fg,
		orange: Colors.accent.amber.fg,
		blue: Colors.accent.blue.fg,
		red: Colors.status.absent.solid,
		purple: Colors.accent.purple.fg,
		yellow: Colors.accent.amber.fg,
		cyan: Colors.accent.cyan.fg,
		pink: Colors.accent.rose.fg,
		teal: "#0D9488",
	},
} as const;

export const NeonShadows = AppShadows;
