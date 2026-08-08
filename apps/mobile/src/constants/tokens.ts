/**
 * Design tokens.
 *
 * Values are deliberately fixed rather than computed so that every screen
 * lands on the same rhythm. Reach for the nearest token instead of adding a
 * one-off number — if nothing fits, the scale is wrong and should change here.
 */

export const Tokens = {
	/**
	 * 4pt base grid. Card padding is `5` (20), gaps between cards are `3` (12),
	 * and screen gutters are `5` (20).
	 */
	space: {
		"0.5": 2,
		"1": 4,
		"1.5": 6,
		"2": 8,
		"2.5": 10,
		"3": 12,
		"3.5": 14,
		"4": 16,
		"5": 20,
		"6": 24,
		"7": 28,
		"8": 32,
		"9": 36,
		"10": 40,
		"12": 48,
		"14": 56,
		"16": 64,
		"20": 80,
	},

	/**
	 * Generous by default — nothing in the UI is sharp. Containers scale their
	 * radius with their size so the curve looks optically constant.
	 */
	radius: {
		xs: 8,
		sm: 12,
		md: 14,
		lg: 18,
		xl: 22,
		"2xl": 26,
		"3xl": 32,
		full: 9999,
	},

	/**
	 * Wide range on purpose. Hierarchy comes from large jumps between display
	 * and meta text, not from nudging weights on similar sizes.
	 */
	fontSize: {
		"2xs": 10,
		xs: 11,
		sm: 12,
		base: 13,
		md: 14,
		lg: 15,
		xl: 16,
		"2xl": 18,
		"3xl": 20,
		"4xl": 23,
		"5xl": 27,
		"6xl": 32,
		"7xl": 40,
	},

	fontWeight: {
		regular: "400" as const,
		medium: "500" as const,
		semibold: "600" as const,
		bold: "700" as const,
		heavy: "800" as const,
	},

	/** Multipliers — apply against fontSize to get a pixel lineHeight. */
	leading: {
		none: 1,
		tight: 1.15,
		snug: 1.3,
		normal: 1.45,
		relaxed: 1.6,
	},

	/** Keep product typography neutral and legible across native font renderers. */
	tracking: {
		tighter: 0,
		tight: 0,
		snug: 0,
		normal: 0,
		wide: 0,
		wider: 0,
		widest: 0,
	},

	/**
	 * Springs, not easing curves — interruptible and physical. `snappy` is the
	 * default for taps; `gentle` for layout shifts; `bouncy` only for playful
	 * one-shot moments like a success check.
	 */
	spring: {
		gentle: { stiffness: 240, damping: 30, mass: 1 },
		snappy: { stiffness: 420, damping: 32, mass: 0.75 },
		bouncy: { stiffness: 380, damping: 20, mass: 0.8 },
	},

	duration: {
		instant: 120,
		fast: 180,
		base: 240,
		slow: 340,
	},

	/** Minimum tap target. Anything interactive should meet this, via hitSlop if needed. */
	touchTarget: 44,
} as const;
