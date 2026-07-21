"use client";

import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { STATS, type Stat } from "../data/landing.data";
import { ATLAS_EASE } from "../lib/motion";
import { FadeIn } from "./fade-in";

export function StatsSection() {
	return (
		<section id="stats" className="px-4 py-20 sm:py-28">
			<div className="mx-auto w-full max-w-6xl">
				<div className="mx-auto max-w-2xl text-center">
					<FadeIn>
						<span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
							At a glance
						</span>
					</FadeIn>
					<FadeIn delay={0.08}>
						<h2 className="mt-5 text-balance font-serif text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
							Built for schools that live on WhatsApp.
						</h2>
					</FadeIn>
				</div>

				<div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border/60 bg-border/60 lg:grid-cols-4">
					{STATS.map((stat, index) => (
						<StatCell key={stat.label} stat={stat} index={index} />
					))}
				</div>
			</div>
		</section>
	);
}

function StatCell({ stat, index }: { stat: Stat; index: number }) {
	return (
		<motion.div
			className="flex flex-col items-center justify-center bg-card px-6 py-10 text-center"
			initial={{ opacity: 0, y: 16 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-40px" }}
			transition={{ duration: 0.5, delay: index * 0.06, ease: ATLAS_EASE }}
			whileHover={{ scale: 1.02 }}
		>
			<span className="font-serif text-4xl font-medium tabular-nums tracking-tight text-foreground sm:text-5xl">
				{stat.display ? (
					stat.display
				) : (
					<CountUp to={stat.value} prefix={stat.prefix} suffix={stat.suffix} delay={index * 0.05} />
				)}
			</span>
			<span className="mt-3 text-sm text-muted-foreground">{stat.label}</span>
			{stat.detail ? (
				<span className="mt-1 text-muted-foreground/70 text-xs">{stat.detail}</span>
			) : null}
		</motion.div>
	);
}

type CountUpProps = {
	to: number;
	prefix: string;
	suffix: string;
	delay?: number;
};

function CountUp({ to, prefix, suffix, delay = 0 }: CountUpProps) {
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, margin: "-60px" });
	const [value, setValue] = useState(0);

	useEffect(() => {
		if (!inView) {
			return;
		}

		const controls = animate(0, to, {
			duration: 1.4,
			delay,
			ease: ATLAS_EASE,
			onUpdate: (latest) => setValue(latest),
		});

		return () => controls.stop();
	}, [inView, to, delay]);

	return (
		<span ref={ref}>
			{prefix}
			{Math.round(value)}
			{suffix}
		</span>
	);
}
