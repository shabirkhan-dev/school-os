"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { CUSTOMER_LOGOS, TRUST_BAR } from "../data/landing.data";
import { springSnappy } from "../lib/motion";
import { FadeIn } from "./fade-in";
import { Marquee } from "./marquee";

export function CustomersSection() {
	return (
		<section id="customers" className="px-4 py-20 sm:py-28">
			<div className="mx-auto w-full max-w-6xl">
				<FadeIn>
					<div className="mx-auto max-w-2xl rounded-2xl border border-primary/15 bg-card px-6 py-5 text-center shadow-sm">
						<p className="font-medium text-foreground text-sm">{TRUST_BAR.headline}</p>
						<p className="mt-2 text-pretty text-muted-foreground text-sm leading-6">
							{TRUST_BAR.detail}
						</p>
					</div>
				</FadeIn>

				<FadeIn delay={0.08}>
					<p className="mt-12 text-center text-sm text-muted-foreground">
						Production stack behind the trust engine
					</p>
				</FadeIn>

				<FadeIn delay={0.12} className="mt-10">
					<Marquee durationSeconds={38}>
						{CUSTOMER_LOGOS.map(({ name, icon }) => (
							<motion.div
								key={name}
								className="flex items-center gap-2.5 rounded-full px-2 text-muted-foreground/80"
								whileHover={{ scale: 1.06, color: "var(--foreground)" }}
								transition={springSnappy}
							>
								<HugeiconsIcon icon={icon} strokeWidth={1.75} className="h-5 w-5" />
								<span className="font-medium text-lg tracking-tight">{name}</span>
							</motion.div>
						))}
					</Marquee>
				</FadeIn>
			</div>
		</section>
	);
}
