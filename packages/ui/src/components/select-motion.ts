import { EASE_OUT } from "@school-os/ui/lib/ease";
import type { motion, Transition, Variants } from "motion/react";
import type { ComponentPropsWithoutRef } from "react";

type DragKey =
	| "onDrag"
	| "onDragStart"
	| "onDragEnd"
	| "onDragEnter"
	| "onDragLeave"
	| "onDragOver"
	| "onDrop";

function omitDragHandlers<T extends Record<string, unknown>>(props: T) {
	const next = { ...props };
	for (const key of [
		"onDrag",
		"onDragStart",
		"onDragEnd",
		"onDragEnter",
		"onDragLeave",
		"onDragOver",
		"onDrop",
	] satisfies DragKey[]) {
		delete next[key];
	}
	return next;
}

/** Strip React DnD handlers that conflict with motion gesture props. */
export function asMotionDivProps(props: object) {
	return omitDragHandlers(props as Record<string, unknown>) as ComponentPropsWithoutRef<
		typeof motion.div
	>;
}

export function asMotionButtonProps(props: object) {
	return omitDragHandlers(props as Record<string, unknown>) as ComponentPropsWithoutRef<
		typeof motion.button
	>;
}

/** beUI select — instant path for reduced motion. */
export const SELECT_INSTANT_TRANSITION: Transition = { duration: 0 };

/** Chevron rotation spring (beUI select). */
export const SELECT_CHEVRON_TRANSITION: Transition = {
	type: "spring",
	duration: 0.4,
	bounce: 0.3,
};

/** Staggered list container (beUI select). */
export const SELECT_LIST_VARIANTS: Variants = {
	hidden: {},
	show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};

/** Individual option entrance (beUI select). */
export const SELECT_ITEM_VARIANTS: Variants = {
	hidden: { opacity: 0, y: -6, filter: "blur(3px)" },
	show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const RADIUS_PX = 12;

/** Near-edge corner keyframes: flat while attached, round when separated. */
export function selectTriggerRadiusKeyframes(open: boolean): [number, number, number] {
	return open ? [0, 0, RADIUS_PX] : [RADIUS_PX, 0, RADIUS_PX];
}

export function selectTriggerRadiusTransition(
	open: boolean,
	isTop: boolean,
	reduce: boolean,
): Transition | Record<string, Transition> {
	if (reduce) return SELECT_INSTANT_TRANSITION;

	const kfT: Transition = open
		? { duration: 0.6, times: [0, 0.4, 1], ease: EASE_OUT }
		: { duration: 0.42, times: [0, 0.5, 1], ease: EASE_OUT };

	return {
		borderTopLeftRadius: isTop ? kfT : SELECT_INSTANT_TRANSITION,
		borderTopRightRadius: isTop ? kfT : SELECT_INSTANT_TRANSITION,
		borderBottomLeftRadius: isTop ? SELECT_INSTANT_TRANSITION : kfT,
		borderBottomRightRadius: isTop ? SELECT_INSTANT_TRANSITION : kfT,
	};
}

export function selectPopupMotion(
	open: boolean,
	isTop: boolean,
	reduce: boolean,
): {
	animate: Record<string, number | [number, number, number]>;
	transition: Transition | Record<string, Transition>;
} {
	const nearGap = open ? 8 : 0;
	const nearRadius = open ? RADIUS_PX : 0;

	const gapT: Transition = open
		? { type: "spring", duration: 0.6, bounce: 0.5, delay: 0.12 }
		: { type: "spring", duration: 0.3, bounce: 0.1 };

	const radiusT: Transition = open
		? { duration: 0.3, ease: EASE_OUT, delay: 0.14 }
		: { duration: 0.16, ease: EASE_OUT };

	if (reduce) {
		return {
			animate: { opacity: open ? 1 : 0, scale: open ? 1 : 0.98 },
			transition: { duration: 0.12 },
		};
	}

	return {
		animate: {
			opacity: open ? 1 : 0,
			scale: open ? 1 : 0.98,
			y: open ? 0 : isTop ? 6 : -6,
			// Gap opens on the side facing the trigger (beUI pinch-and-separate).
			marginTop: isTop ? 0 : nearGap,
			marginBottom: isTop ? nearGap : 0,
			borderTopLeftRadius: isTop ? RADIUS_PX : nearRadius,
			borderTopRightRadius: isTop ? RADIUS_PX : nearRadius,
			borderBottomLeftRadius: isTop ? nearRadius : RADIUS_PX,
			borderBottomRightRadius: isTop ? nearRadius : RADIUS_PX,
		},
		transition: {
			opacity: open ? { duration: 0.18 } : { duration: 0.16, delay: 0.12 },
			scale: open
				? { type: "spring", duration: 0.42, bounce: 0.14 }
				: { duration: 0.26, ease: EASE_OUT, delay: 0.14 },
			y: open
				? { type: "spring", duration: 0.42, bounce: 0.14 }
				: { duration: 0.2, ease: EASE_OUT },
			marginTop: isTop ? SELECT_INSTANT_TRANSITION : gapT,
			marginBottom: isTop ? gapT : SELECT_INSTANT_TRANSITION,
			borderTopLeftRadius: isTop ? SELECT_INSTANT_TRANSITION : radiusT,
			borderTopRightRadius: isTop ? SELECT_INSTANT_TRANSITION : radiusT,
			borderBottomLeftRadius: isTop ? radiusT : SELECT_INSTANT_TRANSITION,
			borderBottomRightRadius: isTop ? radiusT : SELECT_INSTANT_TRANSITION,
		},
	};
}

export function isSelectPopupTop(side: string | null | undefined): boolean {
	return side === "top";
}
