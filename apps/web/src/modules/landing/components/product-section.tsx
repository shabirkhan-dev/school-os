"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { DEMO_STUDENT, PRODUCT_BULLETS } from "../data/landing.data";
import { ATLAS_EASE, springSnappy } from "../lib/motion";
import { FadeIn } from "./fade-in";
import { MeshCanvas } from "./mesh-canvas";
import { ProductTimelineDemo } from "./product-timeline-demo";

export function ProductSection() {
	return (
		<section id="product" className="w-full px-4 py-16 sm:px-8 sm:py-20">
			<div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
				<div>
					<FadeIn>
						<span className="inline-flex items-center rounded-full border border-border bg-card px-3.5 py-1.5 font-medium text-muted-foreground text-xs">
							The killer demo
						</span>
					</FadeIn>

					<FadeIn delay={0.08}>
						<h2 className="mt-6 text-balance font-serif text-3xl text-foreground leading-tight sm:text-4xl">
							Scan once. Parents know. Principals see it live.
						</h2>
					</FadeIn>

					<FadeIn delay={0.14}>
						<p className="mt-5 text-pretty text-muted-foreground text-sm leading-7 sm:text-base sm:leading-8">
							Smart Attendance turns a mundane register into a trust signal — signed QR tokens,
							WhatsApp alerts for parents like {DEMO_STUDENT.shortName}&apos;s ammi, and a dashboard
							that updates during subah ki rush at {DEMO_STUDENT.campus}.
						</p>
					</FadeIn>

					<ul className="mt-7 flex flex-col gap-3">
						{PRODUCT_BULLETS.map((bullet, index) => (
							<motion.li
								key={bullet}
								initial={{ opacity: 0, y: 12 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-60px" }}
								transition={{ duration: 0.5, delay: index * 0.1, ease: ATLAS_EASE }}
								whileHover={{ x: 4 }}
								className="flex items-start gap-3"
							>
								<span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
									<HugeiconsIcon
										icon={Tick02Icon}
										className="size-3"
										strokeWidth={3}
										aria-hidden={true}
									/>
								</span>
								<span className="text-foreground/80 text-sm leading-6">{bullet}</span>
							</motion.li>
						))}
					</ul>
				</div>

				<FadeIn delay={0.1} y={32}>
					<motion.div
						className="relative overflow-hidden rounded-[1.5rem] border border-border p-4 sm:rounded-[2rem] sm:p-7"
						whileHover={{ y: -3 }}
						transition={springSnappy}
					>
						<div className="absolute inset-0 size-full overflow-hidden">
							<MeshCanvas intensity={0.32} palette="teal" />
						</div>
						<div className="relative">
							<ProductTimelineDemo />
						</div>
					</motion.div>
				</FadeIn>
			</div>
		</section>
	);
}
