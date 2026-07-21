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
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { DEMO_STUDENT, INCIDENT_TIMELINE, type IncidentEvent } from "../data/landing.data";
import { ATLAS_EASE } from "../lib/motion";
import { cn } from "../lib/utils";
import { DemoGlassCard } from "./demo-glass-card";

const EVENT_ICONS = {
	activity: Activity01Icon,
	search: Search01Icon,
	pr: GitPullRequestIcon,
	wrench: Wrench01Icon,
	shield: SecurityCheckIcon,
} as const;

const STEP_MS = 1400;

export function ProductTimelineDemo() {
	const reduceMotion = useReducedMotion();
	const [activeIndex, setActiveIndex] = useState(0);

	const advance = useCallback(() => {
		setActiveIndex((prev) => (prev + 1) % INCIDENT_TIMELINE.length);
	}, []);

	useEffect(() => {
		if (reduceMotion) {
			return;
		}
		const timer = window.setInterval(advance, STEP_MS);
		return () => window.clearInterval(timer);
	}, [advance, reduceMotion]);

	return (
		<DemoGlassCard variant="dark" innerClassName="p-4 sm:p-5">
			<div className="flex items-center justify-between gap-2 border-white/10 border-b pb-3">
				<span className="font-medium font-mono text-white text-[11px] sm:text-xs">
					attendance · {DEMO_STUDENT.campus}
				</span>
				<span className="flex shrink-0 items-center gap-1.5 text-[10px] text-white/60">
					<span className="size-1.5 rounded-full bg-emerald-400 atlas-live-dot" />
					{DEMO_STUDENT.time}
				</span>
			</div>

			{/* Mobile: crossfade within a fixed-height slot */}
			<div className="relative mt-4 min-h-[6.5rem] sm:hidden">
				{INCIDENT_TIMELINE.map((event, index) => (
					<motion.div
						key={event.title}
						className="absolute inset-x-0 top-0"
						animate={{ opacity: index === activeIndex ? 1 : 0 }}
						transition={{ duration: 0.3, ease: ATLAS_EASE }}
						aria-hidden={index !== activeIndex}
					>
						<TimelineRow event={event} active highlight={index === activeIndex} />
					</motion.div>
				))}
				<p className="absolute inset-x-0 bottom-0 text-center font-medium text-[10px] text-emerald-400/90">
					Step {activeIndex + 1} of {INCIDENT_TIMELINE.length} · Hassan Raza · Class{" "}
					{DEMO_STUDENT.class}
				</p>
			</div>

			{/* Desktop: full timeline with active highlight */}
			<div className="mt-4 hidden min-h-[22rem] flex-col gap-3 sm:flex sm:gap-3.5">
				{INCIDENT_TIMELINE.map((event, index) => (
					<TimelineRow
						key={event.title}
						event={event}
						active={index === activeIndex}
						done={index < activeIndex}
					/>
				))}
			</div>
		</DemoGlassCard>
	);
}

type TimelineRowProps = {
	event: IncidentEvent;
	active?: boolean;
	done?: boolean;
	highlight?: boolean;
};

function TimelineRow({ event, active, done, highlight }: TimelineRowProps) {
	const icon = EVENT_ICONS[event.icon];
	const isOk = event.tone === "ok";
	const showPulse = active || highlight;

	return (
		<div
			className={cn(
				"flex items-start gap-3 rounded-xl px-1 py-1 transition-colors",
				showPulse && "bg-white/[0.06] ring-1 ring-emerald-400/20",
			)}
		>
			<motion.span
				animate={showPulse ? { scale: [1, 1.08, 1] } : { scale: 1 }}
				transition={{ duration: 0.9, repeat: showPulse ? Number.POSITIVE_INFINITY : 0 }}
				className={cn(
					"grid size-7 shrink-0 place-items-center rounded-full text-white ring-1",
					done || showPulse ? "bg-emerald-500/20 ring-emerald-400/40" : "bg-white/10 ring-white/15",
				)}
			>
				<HugeiconsIcon icon={icon} className="size-3.5" aria-hidden={true} />
			</motion.span>
			<div className="min-w-0 flex-1 pt-0.5">
				<div className="flex items-center gap-2">
					<span
						className={cn(
							"size-1.5 shrink-0 rounded-full",
							isOk ? "bg-emerald-400" : done || showPulse ? "bg-teal-400" : "bg-white/30",
						)}
					/>
					<span className="truncate font-medium text-white text-xs">{event.title}</span>
					{done ? (
						<HugeiconsIcon
							icon={Tick02Icon}
							className="ml-auto size-3 shrink-0 text-emerald-400"
							aria-hidden={true}
						/>
					) : showPulse ? (
						<span className="ml-auto font-mono text-[9px] text-emerald-400">live</span>
					) : null}
				</div>
				<p className="mt-1 break-all font-mono text-[10px] text-white/55 sm:truncate sm:text-[11px]">
					{event.detail}
				</p>
			</div>
		</div>
	);
}
