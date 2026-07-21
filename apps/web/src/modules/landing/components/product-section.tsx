"use client";

import {
	Activity01Icon,
	GitPullRequestIcon,
	Search01Icon,
	SecurityCheckIcon,
	Tick02Icon,
	Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import type { IncidentEvent } from "../data/landing.data";
import { INCIDENT_TIMELINE, PRODUCT_BULLETS } from "../data/landing.data";
import { ATLAS_EASE, springSnappy } from "../lib/motion";
import { FadeIn } from "./fade-in";
import { MeshCanvas } from "./mesh-canvas";

const EVENT_ICONS = {
	activity: Activity01Icon,
	search: Search01Icon,
	pr: GitPullRequestIcon,
	wrench: Wrench01Icon,
	shield: SecurityCheckIcon,
} as const;

export function ProductSection() {
	return (
		<section id="product" className="w-full px-4 py-20 sm:px-8">
			<div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
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
						<p className="mt-5 text-pretty text-muted-foreground leading-8">
							Smart Attendance turns a mundane register into a trust signal — signed QR tokens,
							multi-channel alerts, absentee auto-notify, and a dashboard that updates during
							morning rush.
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
						className="relative overflow-hidden rounded-[2rem] border border-border p-5 sm:p-7"
						whileHover={{ y: -3 }}
						transition={springSnappy}
					>
						<div className="absolute inset-0 size-full overflow-hidden">
							<MeshCanvas intensity={0.32} />
						</div>
						<IncidentTimelineCard />
					</motion.div>
				</FadeIn>
			</div>
		</section>
	);
}

function IncidentTimelineCard() {
	return (
		<div className="relative rounded-2xl border border-white/10 bg-neutral-950/85 p-4 shadow-2xl backdrop-blur-md sm:p-5">
			<div className="flex items-center justify-between border-white/10 border-b pb-3">
				<span className="font-medium font-mono text-white text-xs">attendance · live</span>
				<span className="flex items-center gap-1.5 text-[10px] text-white/60">
					<span className="size-1.5 rounded-full bg-emerald-400" />
					08:17 AM
				</span>
			</div>

			<div className="mt-4 flex flex-col gap-3.5">
				{INCIDENT_TIMELINE.map((event, index) => (
					<TimelineRow key={event.title} event={event} index={index} />
				))}
			</div>
		</div>
	);
}

function TimelineRow({ event, index }: { event: IncidentEvent; index: number }) {
	const icon = EVENT_ICONS[event.icon];
	const isOk = event.tone === "ok";

	return (
		<motion.div
			initial={{ opacity: 0, y: 8 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.45, delay: index * 0.08, ease: ATLAS_EASE }}
			whileHover={{ x: 3 }}
			className="flex cursor-default items-start gap-3"
		>
			<motion.span
				className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15"
				whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.18)" }}
				transition={springSnappy}
			>
				<HugeiconsIcon icon={icon} className="size-3.5" aria-hidden={true} />
			</motion.span>
			<div className="min-w-0 flex-1 pt-0.5">
				<div className="flex items-center gap-2">
					<span
						className={`size-1.5 shrink-0 rounded-full ${isOk ? "bg-emerald-400" : "bg-sky-400"}`}
					/>
					<span className="truncate font-medium text-white text-xs">{event.title}</span>
				</div>
				<p className="mt-1 truncate font-mono text-[11px] text-white/55">{event.detail}</p>
			</div>
		</motion.div>
	);
}
