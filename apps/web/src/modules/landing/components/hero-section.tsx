"use client";

import { File01Icon, Robot01Icon, SentIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { AGENT_MESSAGES, dicebearUrl, HERO_AVATARS, WORKFLOW_STEPS } from "../data/landing.data";
import { FadeIn } from "./fade-in";
import { MeshCanvas } from "./mesh-canvas";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const STEP_DOT: Record<string, string> = {
	scan: "bg-emerald-500",
	record: "bg-sky-500",
	queue: "bg-teal-500",
	notify: "bg-amber-500",
	dashboard: "bg-rose-500",
};

export function HeroSection() {
	return (
		<section className="w-full overflow-hidden px-4 py-16 sm:px-8">
			<div className="mx-auto w-full max-w-5xl">
				<div className="mx-auto max-w-3xl text-center">
					<motion.span
						initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						transition={{ duration: 0.7, ease: EASE }}
						className="inline-flex items-center gap-2 rounded-full bg-card py-1.5 pr-4 pl-1.5 font-medium text-foreground text-sm shadow-[inset_0_1px_3px_rgba(0,0,0,0.07)]"
					>
						<span className="flex">
							{HERO_AVATARS.map((avatar) => (
								// biome-ignore lint/performance/noImgElement: external dicebear avatar SVG, not optimizable via next/image
								<img
									key={avatar.seed}
									src={dicebearUrl(avatar.seed)}
									alt=""
									aria-hidden="true"
									className="-ml-2 size-5 rounded-full ring-2 ring-card first:ml-0"
									loading="eager"
								/>
							))}
						</span>
						Built for private schools that need parent trust
					</motion.span>

					<motion.h1
						initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
						className="mt-6 text-balance font-semibold text-3xl leading-[1.1] tracking-tight sm:text-5xl"
					>
						<span className="text-foreground">Peace of mind for parents.</span>
						<br />
						<span className="text-foreground/40">Proof for schools.</span>
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
						className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground leading-7"
					>
						Mobile-first school management starting with Smart Attendance — scan a QR at the gate,
						alert parents on WhatsApp in seconds, and update the principal dashboard live.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
						animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
						transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
						className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
					>
						<motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
							<Link
								href="#product"
								className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
							>
								See the demo
							</Link>
						</motion.div>
						<motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
							<Link
								href="http://localhost:3002/docs"
								className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-transparent px-6 text-base font-medium text-foreground transition-colors hover:bg-primary/5 sm:w-auto"
							>
								Read the docs
							</Link>
						</motion.div>
					</motion.div>
				</div>

				<FadeIn
					delay={0.2}
					className="relative mt-14 min-h-[28rem] overflow-hidden rounded-3xl border border-border/60 sm:min-h-[32rem]"
					y={40}
				>
					<div className="absolute inset-0 size-full overflow-hidden">
						<MeshCanvas intensity={0.32} />
					</div>
					<div className="relative grid items-start gap-5 p-5 pt-16 sm:grid-cols-2 sm:gap-6 sm:p-10 sm:pt-24">
						<WorkflowCard />
						<AgentChatCard />
					</div>
				</FadeIn>
			</div>
		</section>
	);
}

function WorkflowCard() {
	return (
		<motion.div
			className="rounded-[1.4rem] bg-white/15 p-1.5 shadow-2xl ring-1 ring-white/40 backdrop-blur-md"
			whileHover={{ y: -4, scale: 1.01 }}
			transition={{ type: "spring", stiffness: 420, damping: 28 }}
		>
			<div className="rounded-2xl border border-black/[0.06] bg-white/95 p-4">
				<div className="flex items-center gap-2.5">
					<span className="grid size-8 place-items-center rounded-full bg-neutral-100 text-neutral-600">
						<HugeiconsIcon icon={File01Icon} className="size-4" aria-hidden={true} />
					</span>
					<div>
						<p className="font-semibold text-neutral-900 text-sm">Morning attendance</p>
						<p className="text-[11px] text-neutral-500">Greenfield Academy · Gate A</p>
					</div>
				</div>

				<p className="mt-4 font-medium text-[10px] text-neutral-400 uppercase tracking-wider">
					Live flow
				</p>

				<div className="mt-2 flex flex-col">
					{WORKFLOW_STEPS.map((step, index) => (
						<motion.div
							key={step.label}
							initial={{ opacity: 0, filter: "blur(4px)" }}
							whileInView={{ opacity: 1, filter: "blur(0px)" }}
							viewport={{ once: true }}
							transition={{ duration: 0.4, delay: index * 0.1, ease: EASE }}
							className="flex gap-3 py-1.5"
						>
							<span className="mt-1 flex flex-col items-center">
								<span className={`size-2 rounded-full ${STEP_DOT[step.id] ?? "bg-emerald-500"}`} />
								{index < WORKFLOW_STEPS.length - 1 ? (
									<span className="mt-0.5 h-5 w-px bg-neutral-200" />
								) : null}
							</span>
							<div className="flex-1">
								<div className="flex items-center justify-between gap-2">
									<p className="font-medium text-neutral-800 text-xs">{step.label}</p>
									<span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
										<HugeiconsIcon icon={Tick02Icon} className="size-2.5" aria-hidden={true} />
									</span>
								</div>
								<p className="text-[11px] text-neutral-500">{step.detail}</p>
							</div>
						</motion.div>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, filter: "blur(4px)" }}
					whileInView={{ opacity: 1, filter: "blur(0px)" }}
					viewport={{ once: true }}
					transition={{ duration: 0.4, delay: 0.55, ease: EASE }}
					className="mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5"
				>
					<span className="grid size-5 place-items-center rounded-full bg-emerald-500 text-white">
						<HugeiconsIcon icon={Tick02Icon} className="size-3" aria-hidden={true} />
					</span>
					<span className="font-medium text-emerald-700 text-xs">Parent alert sent</span>
					<span className="ml-auto text-[10px] text-emerald-600/70">09:42</span>
				</motion.div>
			</div>
		</motion.div>
	);
}

function AgentChatCard() {
	return (
		<motion.div
			className="rounded-[1.4rem] bg-white/15 p-1.5 shadow-2xl ring-1 ring-white/40 backdrop-blur-md"
			whileHover={{ y: -4, scale: 1.01 }}
			transition={{ type: "spring", stiffness: 420, damping: 28 }}
		>
			<div className="flex flex-col rounded-2xl border border-black/[0.06] bg-white/95 p-4">
				<div className="flex items-center gap-2.5 border-neutral-100 border-b pb-3">
					<span className="grid size-8 place-items-center rounded-full bg-sky-100 text-sky-600">
						<HugeiconsIcon icon={Robot01Icon} className="size-4" aria-hidden={true} />
					</span>
					<div>
						<p className="font-semibold text-neutral-900 text-sm">Parent · WhatsApp</p>
						<p className="flex items-center gap-1.5 text-[11px] text-neutral-500">
							<span className="size-1.5 rounded-full bg-emerald-500" />
							Online · opted in
						</p>
					</div>
				</div>

				<div className="flex flex-1 flex-col gap-2.5 py-4">
					{AGENT_MESSAGES.map((message, index) => (
						<motion.div
							key={message.text}
							initial={{ opacity: 0, filter: "blur(4px)" }}
							whileInView={{ opacity: 1, filter: "blur(0px)" }}
							viewport={{ once: true }}
							transition={{ duration: 0.45, delay: index * 0.12, ease: EASE }}
							className={
								message.role === "user"
									? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-[var(--atlas-blue)] px-3 py-2 text-white text-xs"
									: "flex max-w-[90%] items-start gap-2 self-start"
							}
						>
							{message.role === "agent" ? (
								<>
									<span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-600">
										<HugeiconsIcon icon={Robot01Icon} className="size-3" aria-hidden={true} />
									</span>
									<p className="rounded-2xl rounded-bl-sm border border-neutral-100 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-700 leading-5">
										{message.text}
									</p>
								</>
							) : (
								message.text
							)}
						</motion.div>
					))}
				</div>

				<div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
					<span className="text-[11px] text-neutral-400">Ask anything or type a command…</span>
					<span className="ml-auto grid size-6 place-items-center rounded-full bg-[var(--atlas-blue)] text-white">
						<HugeiconsIcon icon={SentIcon} className="size-3" aria-hidden={true} />
					</span>
				</div>
			</div>
		</motion.div>
	);
}
