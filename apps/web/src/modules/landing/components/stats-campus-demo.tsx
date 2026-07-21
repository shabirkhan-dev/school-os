"use client";

import { QrCodeIcon, SentIcon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { DEMO_PARENT, DEMO_STUDENT } from "../data/landing.data";
import { ATLAS_EASE } from "../lib/motion";
import { cn } from "../lib/utils";
import { DemoGlassCard } from "./demo-glass-card";

const TICKS = [
	{ label: "Gate scan", detail: `${DEMO_STUDENT.name} · ${DEMO_STUDENT.time}`, icon: QrCodeIcon },
	{
		label: "Alert queued",
		detail: `${DEMO_PARENT.name} · WhatsApp utility`,
		icon: SentIcon,
	},
	{
		label: "Parent notified",
		detail: "Shukriya — subah ki rush mein sukoon mila.",
		icon: WhatsappIcon,
	},
] as const;

const TICK_MS = 2200;

export function StatsCampusDemo() {
	const reduceMotion = useReducedMotion();
	const [tick, setTick] = useState(0);

	const advance = useCallback(() => {
		setTick((prev) => (prev + 1) % TICKS.length);
	}, []);

	useEffect(() => {
		if (reduceMotion) {
			return;
		}
		const timer = window.setInterval(advance, TICK_MS);
		return () => window.clearInterval(timer);
	}, [advance, reduceMotion]);

	const active = TICKS[tick];

	return (
		<DemoGlassCard variant="panel" className="mx-auto mt-10 max-w-xl">
			<div className="flex items-center justify-between gap-2 border-border border-b pb-3">
				<span className="font-medium text-[11px] text-foreground sm:text-xs">
					{DEMO_STUDENT.campus} · subah ki rush
				</span>
				<span className="flex items-center gap-1.5 font-mono text-[10px] text-primary">
					<span className="size-1.5 rounded-full bg-emerald-500 atlas-live-dot" />
					live
				</span>
			</div>

			<div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
				{TICKS.map((step, index) => {
					const isActive = index === tick;
					const isDone = index < tick;

					return (
						<div key={step.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
							<span
								className={cn(
									"grid size-8 place-items-center rounded-full ring-1 sm:size-9",
									isActive
										? "bg-primary/10 text-primary ring-primary/30"
										: isDone
											? "bg-primary/15 text-primary ring-primary/25"
											: "bg-muted text-muted-foreground ring-border/60",
								)}
							>
								<HugeiconsIcon icon={step.icon} className="size-3.5" aria-hidden={true} />
							</span>
							<span className="hidden text-center font-medium text-[9px] text-muted-foreground sm:block">
								{step.label}
							</span>
						</div>
					);
				})}
			</div>

			<motion.p
				key={active.label}
				initial={reduceMotion ? false : { opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.25, ease: ATLAS_EASE }}
				className="mt-4 min-h-[2.75rem] text-center text-pretty text-muted-foreground text-xs leading-5 sm:text-sm"
			>
				<span className="font-medium text-foreground">{active.label}.</span> {active.detail}
			</motion.p>
		</DemoGlassCard>
	);
}
