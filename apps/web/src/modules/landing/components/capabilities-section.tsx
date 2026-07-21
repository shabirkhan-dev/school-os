"use client";

import { Alert02Icon, BracesIcon, SparklesIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import { AGENT_TOOL_CALLS, CAPABILITY_CARDS, type CapabilityCard } from "../data/landing.data";
import { ATLAS_EASE, hoverLift, hoverTap, springSnappy } from "../lib/motion";
import { cn } from "../lib/utils";
import { FadeIn } from "./fade-in";
import { MeshCanvas } from "./mesh-canvas";

const MEMORY_CHIPS = ["Teacher scan app", "Parent WhatsApp + feed", "Principal dashboard"];

const CONNECTED_TOOLS = ["whatsapp", "sms", "push"] as const;

export function CapabilitiesSection() {
	return (
		<section id="capabilities" className="w-full px-4 py-20 sm:px-8">
			<div className="mx-auto w-full max-w-6xl">
				<div className="max-w-2xl">
					<FadeIn>
						<span className="inline-flex items-center rounded-full border border-border/60 bg-card px-3 py-1 font-medium text-muted-foreground text-xs">
							Capabilities
						</span>
					</FadeIn>
					<FadeIn delay={0.08}>
						<h2 className="mt-5 text-balance font-serif text-3xl text-foreground leading-[1.1] sm:text-4xl">
							Everything a school needs — phased, not bloated.
						</h2>
					</FadeIn>
					<FadeIn delay={0.12}>
						<p className="mt-4 max-w-xl text-pretty text-muted-foreground text-sm leading-7">
							Start with attendance and alerts. Add communication, academics, finance, and
							AI-assisted tools on the same production spine — NestJS, Postgres, Expo, and WhatsApp.
						</p>
					</FadeIn>
				</div>

				<div className="mt-12 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-6">
					{CAPABILITY_CARDS.map((card, index) => (
						<FadeIn
							key={card.title}
							delay={index * 0.06}
							y={28}
							className={cn(
								card.span === 4 ? "lg:col-span-4" : "lg:col-span-2",
								(card.kind === "reasoning" || card.kind === "tools") && "sm:col-span-2",
							)}
						>
							<CapabilityTile card={card} />
						</FadeIn>
					))}
				</div>
			</div>
		</section>
	);
}

function CapabilityTile({ card }: { card: CapabilityCard }) {
	const tall = card.kind === "reasoning" || card.kind === "tools";

	return (
		<motion.div
			className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/40 p-3"
			whileHover={hoverLift}
			whileTap={hoverTap}
			transition={springSnappy}
		>
			<div
				className={cn(
					"relative overflow-hidden rounded-2xl",
					tall ? "h-[24rem]" : "flex h-[13rem] items-center justify-center p-5",
					card.kind === "tools" && "p-5",
					card.kind === "memory" && "flex items-center p-5",
				)}
			>
				<div className="absolute inset-0 size-full overflow-hidden">
					<MeshCanvas palette={card.palette} intensity={0.3} speed={0.22} />
				</div>
				<div className="relative z-10 size-full">
					<CapabilityVisual card={card} />
				</div>
			</div>
			<div className="mt-3 shrink-0 px-0.5">
				<h3 className="font-medium text-foreground text-lg">{card.title}</h3>
				<p className="mt-1 text-pretty text-muted-foreground text-sm leading-6">
					{card.description}
				</p>
			</div>
		</motion.div>
	);
}

function CapabilityVisual({ card }: { card: CapabilityCard }) {
	if (card.kind === "reasoning") {
		return <ReasoningVisual />;
	}
	if (card.kind === "tools") {
		return <ToolsVisual />;
	}
	if (card.kind === "memory") {
		return <MemoryVisual />;
	}
	if (card.kind === "output") {
		return <OutputVisual />;
	}
	return <ApprovalVisual />;
}

function ReasoningVisual() {
	return (
		<div className="absolute inset-0 flex items-center justify-center p-6">
			<div className="flex w-full max-w-sm flex-col gap-2.5">
				<div className="max-w-[88%] self-end rounded-2xl rounded-br-sm bg-white px-3.5 py-2 font-medium text-neutral-900 text-xs shadow-lg">
					Student scanned at Gate A — queue parent alert.
				</div>

				<div className="self-start rounded-2xl rounded-bl-sm border border-white/20 bg-white/15 p-3 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md">
					<div className="mb-2 flex items-center gap-2 text-white text-xs">
						<span className="grid size-4 place-items-center rounded-full bg-white/25">
							<HugeiconsIcon icon={SparklesIcon} className="size-2.5" aria-hidden={true} />
						</span>
						<span className="font-medium">Working</span>
						<span className="flex gap-1">
							<span className="size-1 rounded-full bg-white/50" />
							<span className="size-1 rounded-full bg-white/50" />
							<span className="size-1 rounded-full bg-white/50" />
						</span>
					</div>
					<div className="flex flex-col gap-1.5">
						{AGENT_TOOL_CALLS.map((call, index) => (
							<motion.div
								key={call.name}
								initial={{ opacity: 0, y: 6 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.35, delay: index * 0.1, ease: ATLAS_EASE }}
								className="flex items-center gap-2 text-white text-xs"
							>
								<span className="flex-1 font-mono text-[11px]">{call.name}</span>
								<span className="grid size-4 shrink-0 place-items-center rounded-full bg-emerald-400 text-neutral-900">
									<HugeiconsIcon icon={Tick02Icon} className="size-2.5" aria-hidden={true} />
								</span>
							</motion.div>
						))}
					</div>
				</div>

				<div className="max-w-[92%] self-start rounded-2xl rounded-bl-sm border border-white/20 bg-white/15 px-3.5 py-2 text-white text-xs shadow-[0_20px_40px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md">
					WhatsApp delivered · dashboard updated · 247 present.
				</div>
			</div>
		</div>
	);
}

function ToolsVisual() {
	return (
		<div className="relative h-full overflow-hidden rounded-2xl border border-white/10 p-4 font-mono text-xs backdrop-blur-md">
			<div className="mb-3 flex items-center gap-1.5">
				<span className="size-2.5 rounded-full bg-white/15" />
				<span className="size-2.5 rounded-full bg-white/15" />
				<span className="size-2.5 rounded-full bg-white/15" />
			</div>
			<p className="text-white/45">$ notify dispatch</p>
			<div className="mt-2 flex flex-col gap-1.5">
				{CONNECTED_TOOLS.map((tool, index) => (
					<motion.div
						key={tool}
						initial={{ opacity: 0, x: -6 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.35, delay: index * 0.12, ease: ATLAS_EASE }}
						className="flex items-center gap-2 text-emerald-300"
					>
						<span className="grid size-3.5 shrink-0 place-items-center rounded-full bg-emerald-400 text-neutral-900">
							<HugeiconsIcon icon={Tick02Icon} className="size-2.5" aria-hidden={true} />
						</span>
						<span className="text-white/80">connected</span>
						<span className="font-medium text-white">{tool}</span>
					</motion.div>
				))}
			</div>
		</div>
	);
}

function MemoryVisual() {
	return (
		<div className="relative flex w-full flex-col">
			{MEMORY_CHIPS.map((chip) => (
				<div
					key={chip}
					className="mb-1.5 flex items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-3 py-2 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md"
				>
					<span className="grid size-5 shrink-0 place-items-center rounded-md bg-white/20 text-white/80">
						<span className="size-2 rounded-full bg-white/70" />
					</span>
					<span className="truncate text-white text-xs">{chip}</span>
				</div>
			))}
		</div>
	);
}

function OutputVisual() {
	return (
		<div className="relative mx-auto w-full max-w-[15rem] rounded-2xl border border-white/10 bg-neutral-950/85 p-3.5 backdrop-blur-md">
			<div className="flex items-center justify-between">
				<span className="flex items-center gap-1.5 font-mono text-white text-xs">
					<HugeiconsIcon icon={BracesIcon} className="size-3" aria-hidden={true} /> output.json
				</span>
				<span className="inline-flex items-center gap-1 rounded-md bg-emerald-400 px-1.5 py-0.5 text-[10px] text-neutral-900">
					<HugeiconsIcon icon={Tick02Icon} className="size-2.5" aria-hidden={true} /> schema
				</span>
			</div>
			<div className="mt-2.5 font-mono text-[11px] leading-5">
				<p className="text-white/45">{"{"}</p>
				<p className="pl-3">
					<span className="text-emerald-300">&quot;eventType&quot;</span>
					<span className="text-white/45">: </span>
					<span className="text-emerald-300">&quot;attendance.arrival_scanned.v1&quot;</span>
					<span className="text-white/45">,</span>
				</p>
				<p className="pl-3">
					<span className="text-emerald-300">&quot;studentId&quot;</span>
					<span className="text-white/45">: </span>
					<span className="text-emerald-300">&quot;stu_rohan&quot;</span>
					<span className="text-white/45">,</span>
				</p>
				<p className="pl-3">
					<span className="text-emerald-300">&quot;markedAt&quot;</span>
					<span className="text-white/45">: </span>
					<span className="text-emerald-300">&quot;08:17:04&quot;</span>
				</p>
				<p className="text-white/45">{"}"}</p>
			</div>
		</div>
	);
}

function ApprovalVisual() {
	return (
		<div className="relative mx-auto w-full max-w-[15rem] rounded-2xl border border-white/20 bg-white/15 p-3.5 shadow-[0_20px_40px_-28px_rgba(0,0,0,0.5)] backdrop-blur-md">
			<div className="flex items-center gap-1.5 text-[11px] text-white/80">
				<HugeiconsIcon icon={Alert02Icon} className="size-3 text-amber-300" aria-hidden={true} />
				<span className="font-medium">Approval needed</span>
			</div>
			<p className="mt-2 font-mono text-white text-xs">Send AI-drafted report comment?</p>
			<div className="mt-3 flex gap-2">
				<button
					type="button"
					className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-400 py-2 font-medium text-[11px] text-neutral-900"
				>
					<HugeiconsIcon icon={Tick02Icon} className="size-3" aria-hidden={true} />
					Approve
				</button>
				<button
					type="button"
					className="flex-1 rounded-lg border border-white/20 bg-white/10 py-2 font-medium text-[11px] text-white"
				>
					Edit
				</button>
			</div>
		</div>
	);
}
