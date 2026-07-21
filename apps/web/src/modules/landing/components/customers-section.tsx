"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { CUSTOMER_LOGOS } from "../data/landing.data";
import { springSnappy } from "../lib/motion";
import { FadeIn } from "./fade-in";
import { Marquee } from "./marquee";

export function CustomersSection() {
	return (
		<section id="customers" className="px-4 py-20 sm:py-28">
			<div className="mx-auto w-full max-w-6xl">
				<FadeIn>
					<p className="text-center text-sm text-muted-foreground">
						Production stack behind the trust engine
					</p>
				</FadeIn>

				<FadeIn delay={0.1} className="mt-10">
					<Marquee durationSeconds={38}>
						{CUSTOMER_LOGOS.map(({ name, icon }) => (
							<motion.div
								key={name}
								className="flex items-center gap-2.5 rounded-full px-2 text-muted-foreground/80"
								whileHover={{ scale: 1.06, color: "var(--foreground)" }}
								transition={springSnappy}
							>
								<HugeiconsIcon icon={icon} className="h-5 w-5" strokeWidth={1.75} />
								<span className="text-lg font-medium tracking-tight">{name}</span>
							</motion.div>
						))}
					</Marquee>
				</FadeIn>
			</div>
		</section>
	);
}
