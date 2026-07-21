"use client";

import {
	Activity01Icon,
	ArrowRight01Icon,
	FingerPrintIcon,
	HexagonIcon,
	HierarchyIcon,
	Key01Icon,
	LockIcon,
	SecurityCheckIcon,
	Tick02Icon,
	TriangleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	motion,
	useInView,
	useMotionValue,
	useReducedMotion,
	useSpring,
	useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import { DEMO_PARENT, DEMO_STUDENT, WHY_CARDS, type WhyCard } from "../data/landing.data";
import { ATLAS_EASE, springSnappy, springSoft } from "../lib/motion";
import { useAtlasTheme } from "../lib/theme";
import { cn } from "../lib/utils";
import { FadeIn } from "./fade-in";
import { MeshCanvas, WHY_RIM_COLORS, WHY_RIM_COLORS_DARK } from "./mesh-canvas";

const RIM_KEY: Record<WhyCard["palette"], keyof typeof WHY_RIM_COLORS> = {
	blue: "blue",
	lime: "lime",
	amber: "amber",
	teal: "lime",
};

const viewport = { once: true, amount: 0.45 } as const;

const pill =
	"inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1c1c22] px-3 py-2 text-[11px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]";

export function WhySection() {
	return (
		<section id="why" className="w-full px-4 py-20 sm:px-8 sm:py-28">
			<div className="mx-auto w-full max-w-6xl">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
					<div className="max-w-xl">
						<FadeIn>
							<span className="inline-flex items-center rounded-full border border-border/70 bg-muted/50 px-3 py-1 font-medium text-foreground/85 text-xs">
								Why School OS
							</span>
						</FadeIn>
						<FadeIn delay={0.06}>
							<h2 className="mt-5 text-balance font-serif text-3xl text-foreground leading-[1.12] sm:text-4xl lg:text-[2.75rem]">
								Not another ERP. A trust engine.
							</h2>
						</FadeIn>
					</div>
					<FadeIn delay={0.1} className="max-w-sm lg:pb-1">
						<p className="text-pretty text-muted-foreground text-sm leading-7 sm:text-base">
							Affordable private schools need admissions growth and parent peace of mind — not
							another dashboard nobody opens. School OS starts where trust is won or lost: the
							school gate.
						</p>
					</FadeIn>
				</div>

				<div className="mt-12 grid items-stretch gap-6 md:grid-cols-3 md:gap-7">
					{WHY_CARDS.map((card, index) => (
						<FadeIn key={card.id} delay={0.08 + index * 0.06} y={28} className="h-full">
							<WhyCardItem card={card} />
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}

function WhyCardItem({ card }: { card: WhyCard }) {
	const { theme } = useAtlasTheme();
	const rim = RIM_KEY[card.palette];
	const rimColors = theme === "dark" ? WHY_RIM_COLORS_DARK : WHY_RIM_COLORS;

	return (
		<article className="flex h-full flex-col">
			<div className="relative flex h-[20rem] w-full shrink-0 flex-col overflow-hidden rounded-[1.75rem] p-[10px] sm:h-[23.5rem]">
				<div className="absolute inset-0 overflow-hidden">
					<MeshCanvas
						palette={card.palette}
						colors={rimColors[rim]}
						intensity={0.38}
						speed={0.14}
					/>
				</div>
				{/* Solid charcoal plate — Meridian style, no tint mush */}
				<div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.35rem] bg-[#141418] p-4 sm:p-5">
					{card.kind === "route" ? <RoutePreview /> : null}
					{card.kind === "keys" ? <KeysPreview /> : null}
					{card.kind === "ready" ? <ReadyPreview /> : null}
				</div>
			</div>

			<h3 className="mt-5 font-medium text-foreground text-lg tracking-tight">{card.title}</h3>
			<p className="mt-2 flex-1 text-pretty text-muted-foreground text-sm leading-6">
				{card.description}
			</p>
		</article>
	);
}

/** Gate scan → parent alert → live dashboard — the ninety-second trust loop. */
function RoutePreview() {
	const reduce = useReducedMotion();

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex items-start justify-between gap-2">
				<div>
					<p className="font-medium text-[13px] text-white">Trust loop</p>
					<p className="mt-0.5 text-[11px] text-white/45">
						{DEMO_STUDENT.campus} · {DEMO_STUDENT.gate}
					</p>
				</div>
				<span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-medium text-[10px] text-emerald-300">
					&lt;5s
				</span>
			</div>

			<div className="relative mt-6 flex min-h-0 flex-1 items-center justify-between gap-3 px-0.5">
				{/* Forks drawn in viewBox aligned to left pill → right column */}
				<svg
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 size-full text-white/35"
					viewBox="0 0 320 160"
					fill="none"
					preserveAspectRatio="none"
				>
					{["M88 80 C 150 80, 190 40, 248 40", "M88 80 C 150 80, 190 120, 248 120"].map((d, i) => (
						<motion.path
							key={d}
							d={d}
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							initial={reduce ? false : { pathLength: 0, opacity: 0 }}
							whileInView={{ pathLength: 1, opacity: 1 }}
							viewport={viewport}
							transition={{ duration: 0.65, delay: 0.12 + i * 0.1, ease: ATLAS_EASE }}
						/>
					))}
				</svg>

				{/* Source = horizontal dark pill (not a circle) */}
				<motion.div
					className={cn(pill, "relative z-10 shrink-0 pl-1.5")}
					initial={reduce ? false : { opacity: 0, x: -10 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={viewport}
					transition={springSoft}
				>
					<span className="grid size-7 place-items-center rounded-full bg-[#2a2a32] text-emerald-300">
						<HugeiconsIcon icon={Activity01Icon} className="size-3.5" aria-hidden={true} />
					</span>
					<span className="pr-1 font-medium text-white">{DEMO_STUDENT.time}</span>
				</motion.div>

				<div className="relative z-10 flex flex-col gap-6">
					{([{ label: "WhatsApp sent" }, { label: "Dashboard +1" }] as const).map((dest, i) => (
						<motion.div
							key={dest.label}
							className={cn(pill, "min-w-[7.25rem] justify-center")}
							initial={reduce ? false : { opacity: 0, x: 12 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={viewport}
							transition={{ ...springSoft, delay: 0.28 + i * 0.1 }}
						>
							{dest.label}
						</motion.div>
					))}
				</div>
			</div>

			<motion.div
				className="mt-4 flex items-center justify-between gap-2 rounded-full bg-white px-4 py-2.5"
				initial={reduce ? false : { opacity: 0, y: 8 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={viewport}
				transition={{ ...springSnappy, delay: 0.5 }}
			>
				<span className="truncate font-medium text-[11px] text-neutral-900">
					{DEMO_STUDENT.name} · Class {DEMO_STUDENT.class}
				</span>
				<span className="shrink-0 font-mono text-[11px] text-emerald-700 tabular-nums">
					present
				</span>
			</motion.div>
		</div>
	);
}

/** Guardian consent, quiet hours, and audit — no alert ships unchecked. */
function KeysPreview() {
	const reduce = useReducedMotion();

	const shares = [
		{
			label: "Opt-in",
			className: "absolute top-2 left-2",
			path: "M56 28 L112 88",
		},
		{
			label: "Quiet hrs",
			className: "absolute top-2 right-2",
			path: "M184 28 L128 88",
		},
		{
			label: "Audit log",
			className: "absolute bottom-3 left-1/2 -translate-x-1/2",
			path: "M120 148 L120 112",
		},
	] as const;

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div>
				<p className="font-medium text-[13px] text-white">Guardian safety gates</p>
				<p className="mt-0.5 text-[11px] text-white/45">{DEMO_PARENT.name} · opted in · WhatsApp</p>
			</div>

			<div className="relative mt-2 flex min-h-0 flex-1 items-center justify-center">
				<svg
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 size-full text-white/30"
					viewBox="0 0 240 180"
					fill="none"
				>
					{shares.map((share, i) => (
						<motion.path
							key={share.path}
							d={share.path}
							stroke="currentColor"
							strokeWidth="1.35"
							strokeLinecap="round"
							initial={reduce ? false : { pathLength: 0, opacity: 0 }}
							whileInView={{ pathLength: 1, opacity: 1 }}
							viewport={viewport}
							transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: ATLAS_EASE }}
						/>
					))}
				</svg>

				{shares.map((share, i) => (
					<motion.span
						key={share.label}
						className={cn(pill, "z-10 gap-1.5 py-1.5 pr-3 pl-2.5", share.className)}
						initial={reduce ? false : { opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={viewport}
						transition={{ ...springSnappy, delay: 0.22 + i * 0.08 }}
					>
						<HugeiconsIcon icon={Key01Icon} className="size-3 text-white/55" aria-hidden={true} />
						{share.label}
					</motion.span>
				))}

				<motion.span
					className="relative z-10 grid size-[3.75rem] place-items-center rounded-2xl bg-white text-neutral-900"
					initial={reduce ? false : { opacity: 0, scale: 0.8 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={viewport}
					transition={springSnappy}
				>
					<HugeiconsIcon icon={FingerPrintIcon} className="size-7" aria-hidden={true} />
				</motion.span>
			</div>

			<motion.div
				className="flex items-start gap-2.5"
				initial={reduce ? false : { opacity: 0, y: 6 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={viewport}
				transition={{ duration: 0.4, delay: 0.45, ease: ATLAS_EASE }}
			>
				<span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-400 text-neutral-950">
					<HugeiconsIcon
						icon={SecurityCheckIcon}
						className="size-3"
						strokeWidth={2.5}
						aria-hidden={true}
					/>
				</span>
				<div>
					<p className="font-medium text-[12px] text-white">No alert without consent</p>
					<p className="mt-0.5 text-[11px] text-white/45">
						Utility templates only · delivery logged.
					</p>
				</div>
			</motion.div>
		</div>
	);
}

function AnimatedCount({ value }: { value: number }) {
	const reduce = useReducedMotion();
	const ref = useRef<HTMLSpanElement>(null);
	const inView = useInView(ref, { once: true, amount: 0.5 });
	const motionValue = useMotionValue(0);
	const spring = useSpring(motionValue, { stiffness: 80, damping: 24 });
	const display = useTransform(spring, (latest) => Math.round(latest).toLocaleString("en-PK"));

	useEffect(() => {
		if (reduce) {
			motionValue.set(value);
			return;
		}
		if (inView) motionValue.set(value);
	}, [inView, motionValue, reduce, value]);

	if (reduce) {
		return <span ref={ref}>{value.toLocaleString("en-PK")}</span>;
	}

	return <motion.span ref={ref}>{display}</motion.span>;
}

/** Phased modules on one NestJS + Postgres spine — attendance first. */
function ReadyPreview() {
	const reduce = useReducedMotion();
	const rows = [
		{
			name: "Smart Attendance",
			phase: "Phase 1 · live",
			Icon: HexagonIcon,
			tone: "text-emerald-300",
		},
		{ name: "Parent comms", phase: "Phase 2", Icon: TriangleIcon, tone: "text-violet-300" },
		{ name: "Fee collection", phase: "Phase 3", Icon: HierarchyIcon, tone: "text-amber-300" },
	] as const;

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex items-start justify-between gap-2">
				<div>
					<p className="font-medium text-[13px] text-white">Phase roadmap</p>
					<p className="mt-0.5 text-[11px] text-white/45">One spine · module by module</p>
				</div>
				<motion.span
					className="grid size-6 place-items-center rounded-full bg-teal-400 text-neutral-950"
					initial={reduce ? false : { scale: 0 }}
					whileInView={{ scale: 1 }}
					viewport={viewport}
					transition={springSnappy}
				>
					<HugeiconsIcon
						icon={Tick02Icon}
						className="size-3.5"
						strokeWidth={3}
						aria-hidden={true}
					/>
				</motion.span>
			</div>

			<div className="mt-4">
				<p className="text-[11px] text-white/45">Students on pilot spine</p>
				<p className="mt-1 font-medium text-[1.7rem] text-white tabular-nums tracking-tight">
					<AnimatedCount value={247} />
					<span className="ml-1 text-[1rem] text-white/50">present today</span>
				</p>
			</div>

			<ul className="mt-3 flex flex-col gap-1">
				{rows.map((row, i) => (
					<motion.li
						key={row.name}
						className="flex items-center gap-2.5 py-1.5"
						initial={reduce ? false : { opacity: 0, y: 8 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={viewport}
						transition={{ ...springSoft, delay: 0.18 + i * 0.09 }}
					>
						<span
							className={cn(
								"grid size-7 shrink-0 place-items-center rounded-lg bg-white/[0.06]",
								row.tone,
							)}
						>
							<HugeiconsIcon icon={row.Icon} className="size-3.5" aria-hidden={true} />
						</span>
						<span className="min-w-0 flex-1 truncate text-[12px] text-white">{row.name}</span>
						<span className="font-medium text-[11px] text-white/70">{row.phase}</span>
						<motion.span
							initial={reduce ? false : { scale: 0 }}
							whileInView={{ scale: 1 }}
							viewport={viewport}
							transition={{ ...springSnappy, delay: 0.32 + i * 0.09 }}
						>
							<HugeiconsIcon
								icon={Tick02Icon}
								className="size-3.5 text-emerald-400"
								aria-hidden={true}
							/>
						</motion.span>
					</motion.li>
				))}
			</ul>

			<motion.div
				className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-white py-2.5 font-medium text-[12px] text-neutral-900"
				initial={reduce ? false : { opacity: 0, y: 8 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={viewport}
				transition={{ ...springSnappy, delay: 0.5 }}
			>
				<HugeiconsIcon icon={LockIcon} className="size-3.5" aria-hidden={true} />
				Start pilot
				<HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" aria-hidden={true} />
			</motion.div>
		</div>
	);
}
