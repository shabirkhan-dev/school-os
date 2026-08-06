import type { TextStyle } from "react-native";
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

	/** Raised surface: cards, sheets, the tab bar. */
	surface: "#FFFFFF",

	/** Recessed surface: input wells, track backgrounds, inactive segments. */
	sunken: "#EDEAE5",

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
 * Shadows.
 *
 * Large radius, low opacity, warm-tinted. A wide soft shadow reads as depth;
 * a tight dark one reads as a drop shadow sticker. Offset stays under half the
 * radius so the light source feels high and diffuse.
 */
export const Shadows = {
	/** Resting cards. Barely perceptible on its own; matters in aggregate. */
	xs: {
		shadowColor: "#2E2A24",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 3,
		elevation: 1,
	},

	/** Grouped content, list rows. */
	sm: {
		shadowColor: "#2E2A24",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},

	/** Primary/hero cards that should sit above their neighbours. */
	md: {
		shadowColor: "#2E2A24",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.07,
		shadowRadius: 16,
		elevation: 4,
	},

	/** Floating chrome: tab bar, FAB. */
	lg: {
		shadowColor: "#2E2A24",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.09,
		shadowRadius: 24,
		elevation: 8,
	},

	/** Modals and sheets. */
	xl: {
		shadowColor: "#2E2A24",
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.12,
		shadowRadius: 32,
		elevation: 12,
	},
} as const;

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
