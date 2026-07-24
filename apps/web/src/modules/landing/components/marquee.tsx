"use client";

import { useReducedMotion } from "motion/react";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "../lib/utils";

type MarqueeProps = {
	children: ReactNode;
	className?: string;
	reverse?: boolean;
	durationSeconds?: number;
	gap?: string;
	pauseOnHover?: boolean;
};

type MarqueeStyle = CSSProperties & {
	"--atlas-gap"?: string;
	"--atlas-duration"?: string;
	"--atlas-direction"?: string;
};

export function Marquee({
	children,
	className,
	reverse = false,
	durationSeconds = 40,
	gap = "2rem",
	pauseOnHover = true,
}: MarqueeProps) {
	const reduceMotion = useReducedMotion();
	const style: MarqueeStyle = {
		"--atlas-gap": gap,
		"--atlas-duration": `${durationSeconds}s`,
		"--atlas-direction": reverse ? "reverse" : "normal",
	};

	if (reduceMotion) {
		return (
			<div
				className={cn(
					"atlas-marquee-mask relative flex w-full overflow-x-auto overscroll-x-contain",
					className,
				)}
				style={{ gap }}
			>
				<div className="flex w-max shrink-0 items-stretch" style={{ gap, paddingRight: gap }}>
					{children}
				</div>
			</div>
		);
	}

	return (
		<div
			className={cn(
				"atlas-marquee-mask relative flex w-full overflow-hidden",
				pauseOnHover && "atlas-marquee-group",
				className,
			)}
			style={style}
		>
			<div
				className="atlas-marquee-track flex w-max shrink-0 items-stretch"
				style={{ gap, paddingRight: gap }}
			>
				{children}
			</div>
			<div
				aria-hidden
				className="atlas-marquee-track flex w-max shrink-0 items-stretch"
				style={{ gap, paddingRight: gap }}
			>
				{children}
			</div>
		</div>
	);
}
