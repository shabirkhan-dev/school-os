"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { ATLAS_EASE } from "../lib/motion";
import { cn } from "../lib/utils";

type FadeInProps = {
	children: ReactNode;
	className?: string;
	delay?: number;
	/** Vertical slide in px — keep 0 to avoid perceived layout jump on scroll. */
	y?: number;
	blur?: number;
	duration?: number;
	once?: boolean;
};

export function FadeIn({
	children,
	className,
	delay = 0,
	y = 0,
	blur = 0,
	duration = 0.55,
	once = true,
}: FadeInProps) {
	const reduceMotion = useReducedMotion();

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	const initial: Record<string, string | number> = { opacity: 0 };
	const animate: Record<string, string | number> = { opacity: 1 };

	if (y !== 0) {
		initial.y = y;
		animate.y = 0;
	}
	if (blur > 0) {
		initial.filter = `blur(${blur}px)`;
		animate.filter = "blur(0px)";
	}

	return (
		<motion.div
			className={className}
			initial={initial}
			whileInView={animate}
			viewport={{ once, margin: "-40px" }}
			transition={{ duration, delay, ease: ATLAS_EASE }}
		>
			{children}
		</motion.div>
	);
}

type StaggerProps = {
	children: ReactNode;
	className?: string;
	delay?: number;
	stagger?: number;
	once?: boolean;
};

export function Stagger({
	children,
	className,
	delay = 0,
	stagger = 0.08,
	once = true,
}: StaggerProps) {
	const reduceMotion = useReducedMotion();

	const container: Variants = {
		hidden: {},
		show: {
			transition: { staggerChildren: stagger, delayChildren: delay },
		},
	};

	if (reduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			className={className}
			variants={container}
			initial="hidden"
			whileInView="show"
			viewport={{ once, margin: "-40px" }}
		>
			{children}
		</motion.div>
	);
}

type StaggerItemProps = {
	children: ReactNode;
	className?: string;
	y?: number;
};

export function StaggerItem({ children, className, y = 0 }: StaggerItemProps) {
	const reduceMotion = useReducedMotion();

	const item: Variants = {
		hidden: {
			opacity: 0,
			...(y !== 0 ? { y } : {}),
		},
		show: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.5, ease: ATLAS_EASE },
		},
	};

	if (reduceMotion) {
		return <div className={cn(className)}>{children}</div>;
	}

	return (
		<motion.div className={cn(className)} variants={item}>
			{children}
		</motion.div>
	);
}
