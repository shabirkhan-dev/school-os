"use client";

import { QrCodeIcon, SentIcon, Tick02Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import {
	DEMO_STUDENT,
	dicebearUrl,
	WALKTHROUGH_PHASES,
	WALKTHROUGH_WHATSAPP,
	type WalkthroughPhaseId,
	WORKFLOW_STEPS,
} from "../data/landing.data";
import { ATLAS_EASE, springSnappy } from "../lib/motion";
import { cn } from "../lib/utils";

const PHASE_TO_STEP: Record<WalkthroughPhaseId, number> = {
	scan: 0,
	identify: 0,
	mark: 1,
	queue: 2,
	notify: 3,
	dashboard: 4,
};

const WHATSAPP_VISIBLE: Record<WalkthroughPhaseId, number> = {
	scan: 0,
	identify: 0,
	mark: 0,
	queue: 0,
	notify: 1,
	dashboard: 3,
};

function phaseIndex(id: WalkthroughPhaseId): number {
	return WALKTHROUGH_PHASES.findIndex((phase) => phase.id === id);
}

export function AttendanceWalkthrough() {
	const reduceMotion = useReducedMotion();
	const [phaseIdx, setPhaseIdx] = useState(0);
	const phase = WALKTHROUGH_PHASES[phaseIdx] ?? WALKTHROUGH_PHASES[0];
	const activeStep = PHASE_TO_STEP[phase.id];
	const whatsappCount = WHATSAPP_VISIBLE[phase.id];

	const advance = useCallback(() => {
		setPhaseIdx((prev) => (prev + 1) % WALKTHROUGH_PHASES.length);
	}, []);

	useEffect(() => {
		if (reduceMotion) {
			return;
		}
		const timer = window.setTimeout(advance, phase.durationMs);
		return () => window.clearTimeout(timer);
	}, [advance, phase.durationMs, reduceMotion]);

	const goToPhase = (index: number) => {
		setPhaseIdx(index);
	};

	return (
		<div className="flex flex-col gap-4">
			<WalkthroughStepper
				currentIndex={phaseIdx}
				onSelect={goToPhase}
				reduceMotion={!!reduceMotion}
			/>

			<div className="grid items-stretch gap-4 sm:grid-cols-2 sm:gap-5">
				<GuardScannerPanel phase={phase.id} reduceMotion={!!reduceMotion} />
				<div className="flex flex-col gap-4">
					<WorkflowTimeline activeStep={activeStep} phase={phase.id} />
					<WhatsAppPanel visibleCount={whatsappCount} phase={phase.id} />
					<DashboardStrip show={phase.id === "dashboard"} reduceMotion={!!reduceMotion} />
				</div>
			</div>
		</div>
	);
}

type StepperProps = {
	currentIndex: number;
	onSelect: (index: number) => void;
	reduceMotion: boolean;
};

function WalkthroughStepper({ currentIndex, onSelect, reduceMotion }: StepperProps) {
	return (
		<div
			className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
			role="tablist"
			aria-label="Attendance demo steps"
		>
			{WALKTHROUGH_PHASES.map((step, index) => {
				const isActive = index === currentIndex;
				const isDone = index < currentIndex;

				return (
					<button
						key={step.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onSelect(index)}
						className={cn(
							"relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 font-medium text-[10px] transition-colors sm:px-3 sm:text-[11px]",
							isActive
								? "bg-white/95 text-primary shadow-sm ring-1 ring-white/80"
								: isDone
									? "bg-white/40 text-white/90"
									: "bg-white/20 text-white/75 hover:bg-white/30",
						)}
					>
						{isDone ? (
							<span className="grid size-3.5 place-items-center rounded-full bg-emerald-500 text-white">
								<HugeiconsIcon icon={Tick02Icon} className="size-2" aria-hidden={true} />
							</span>
						) : (
							<span
								className={cn(
									"size-1.5 rounded-full",
									isActive ? "bg-primary atlas-live-dot" : "bg-white/50",
								)}
							/>
						)}
						{step.label}
						{isActive && !reduceMotion ? (
							<motion.span
								layoutId="walkthrough-progress"
								className="pointer-events-none absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary/60"
								transition={springSnappy}
							/>
						) : null}
					</button>
				);
			})}
		</div>
	);
}

type GuardScannerPanelProps = {
	phase: WalkthroughPhaseId;
	reduceMotion: boolean;
};

function GuardScannerPanel({ phase, reduceMotion }: GuardScannerPanelProps) {
	const showStudent = phaseIndex(phase) >= phaseIndex("identify");
	const showStamp = phaseIndex(phase) >= phaseIndex("mark");

	return (
		<div className="rounded-[1.4rem] bg-white/20 p-1.5 shadow-xl ring-1 ring-white/50 backdrop-blur-md">
			<div className="rounded-2xl border border-black/[0.06] bg-white/96 p-4">
				<div className="flex items-center justify-between gap-2">
					<div>
						<p className="font-semibold text-neutral-900 text-sm">Gate guard · mobile</p>
						<p className="text-[11px] text-neutral-500">
							{DEMO_STUDENT.campus} · {DEMO_STUDENT.gate}
						</p>
					</div>
					<span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-[10px] text-emerald-700">
						Smart Attendance
					</span>
				</div>

				<div className="relative mt-4 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-950 p-3">
					<AnimatePresence mode="wait">
						{!showStudent ? (
							<motion.div
								key="scanner"
								initial={reduceMotion ? false : { opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.35, ease: ATLAS_EASE }}
								className="relative mx-auto aspect-[4/5] max-w-[11rem]"
							>
								<div className="absolute inset-0 rounded-xl border-2 border-emerald-400/40" />
								<div className="absolute top-3 left-3 size-5 border-emerald-400 border-t-2 border-l-2" />
								<div className="absolute top-3 right-3 size-5 border-emerald-400 border-t-2 border-r-2" />
								<div className="absolute bottom-3 left-3 size-5 border-emerald-400 border-b-2 border-l-2" />
								<div className="absolute bottom-3 right-3 size-5 border-emerald-400 border-b-2 border-r-2" />

								<div className="absolute inset-4 grid place-items-center rounded-lg bg-white p-2">
									<QrCodePattern />
								</div>

								{!reduceMotion ? (
									<motion.div
										className="absolute inset-x-4 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]"
										animate={{ top: ["12%", "78%", "12%"] }}
										transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
									/>
								) : null}

								<p className="absolute inset-x-0 bottom-2 text-center font-medium text-[10px] text-emerald-300">
									Align student QR in frame
								</p>
							</motion.div>
						) : (
							<motion.div
								key="student"
								initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.96 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								transition={{ duration: 0.45, ease: ATLAS_EASE }}
								className="relative mx-auto max-w-[13rem]"
							>
								<StudentCard showStamp={showStamp} reduceMotion={reduceMotion} />
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<p className="mt-3 text-center text-[11px] text-neutral-500">
					{phase === "scan"
						? "Scanning signed QR token…"
						: phase === "identify"
							? "Student matched · verifying enrolment"
							: showStamp
								? "Attendance saved · alert queued"
								: "Ready to mark present"}
				</p>
			</div>
		</div>
	);
}

function QrCodePattern() {
	return (
		<div className="grid size-full grid-cols-5 grid-rows-5 gap-0.5 p-1" aria-hidden="true">
			{Array.from({ length: 25 }, (_, i) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: static decorative grid
					key={i}
					className={cn(
						"rounded-[1px]",
						[0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 20, 21, 22, 24].includes(i)
							? "bg-neutral-900"
							: "bg-neutral-200",
					)}
				/>
			))}
		</div>
	);
}

type StudentCardProps = {
	showStamp: boolean;
	reduceMotion: boolean;
};

function StudentCard({ showStamp, reduceMotion }: StudentCardProps) {
	return (
		<div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
			<div className="flex items-center gap-3">
				{/* biome-ignore lint/performance/noImgElement: dicebear demo avatar */}
				<img
					src={dicebearUrl(DEMO_STUDENT.avatarSeed)}
					alt=""
					className="size-12 rounded-full ring-2 ring-emerald-100"
				/>
				<div className="min-w-0">
					<p className="truncate font-semibold text-neutral-900 text-sm">{DEMO_STUDENT.name}</p>
					<p className="text-[11px] text-neutral-500">
						Class {DEMO_STUDENT.class} · {DEMO_STUDENT.section}
					</p>
					<p className="font-mono text-[10px] text-neutral-400">{DEMO_STUDENT.studentId}</p>
				</div>
			</div>

			<div className="mt-3 flex items-center justify-between rounded-lg bg-neutral-50 px-2.5 py-2">
				<span className="text-[10px] text-neutral-500">Token verified</span>
				<span className="inline-flex items-center gap-1 font-medium text-[10px] text-emerald-700">
					<HugeiconsIcon icon={Tick02Icon} className="size-3" aria-hidden={true} />
					Signed
				</span>
			</div>

			<AnimatePresence>
				{showStamp ? (
					<motion.div
						key="stamp"
						initial={reduceMotion ? false : { opacity: 0, scale: 1.6, rotate: -12 }}
						animate={{ opacity: 1, scale: 1, rotate: -6 }}
						transition={{ type: "spring", stiffness: 380, damping: 22 }}
						className="pointer-events-none absolute inset-0 grid place-items-center bg-emerald-500/10"
					>
						<span className="rounded-lg border-2 border-emerald-600 bg-emerald-50/95 px-4 py-2 font-bold text-emerald-700 text-sm tracking-wider shadow-lg">
							PRESENT
						</span>
					</motion.div>
				) : null}
			</AnimatePresence>
		</div>
	);
}

type WorkflowTimelineProps = {
	activeStep: number;
	phase: WalkthroughPhaseId;
};

function WorkflowTimeline({ activeStep, phase }: WorkflowTimelineProps) {
	return (
		<div className="rounded-[1.4rem] bg-white/20 p-1.5 shadow-xl ring-1 ring-white/50 backdrop-blur-md">
			<div className="rounded-2xl border border-black/[0.06] bg-white/96 p-4">
				<div className="flex items-center gap-2">
					<span className="grid size-7 place-items-center rounded-full bg-emerald-50 text-primary">
						<HugeiconsIcon icon={QrCodeIcon} className="size-3.5" aria-hidden={true} />
					</span>
					<div>
						<p className="font-semibold text-neutral-900 text-sm">Live pipeline</p>
						<p className="text-[10px] text-neutral-500">Outbox · WhatsApp · dashboard</p>
					</div>
				</div>

				<ol className="mt-3 flex flex-col">
					{WORKFLOW_STEPS.map((step, index) => {
						const isActive = index === activeStep;
						const isDone = index < activeStep;

						return (
							<motion.li
								key={step.id}
								layout
								className={cn(
									"flex gap-3 rounded-lg py-1.5 pr-1 transition-colors",
									isActive && "bg-emerald-50/80",
								)}
							>
								<span className="mt-1 flex flex-col items-center">
									<motion.span
										animate={
											isActive
												? { scale: [1, 1.25, 1], opacity: 1 }
												: { scale: 1, opacity: isDone ? 1 : 0.45 }
										}
										transition={{ duration: 0.8, repeat: isActive ? Number.POSITIVE_INFINITY : 0 }}
										className={cn(
											"size-2 rounded-full",
											isDone || isActive ? "bg-emerald-500" : "bg-neutral-300",
										)}
									/>
									{index < WORKFLOW_STEPS.length - 1 ? (
										<span
											className={cn(
												"mt-0.5 h-5 w-px",
												isDone ? "bg-emerald-300" : "bg-neutral-200",
											)}
										/>
									) : null}
								</span>
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between gap-2">
										<p
											className={cn(
												"font-medium text-xs",
												isActive ? "text-emerald-800" : "text-neutral-800",
											)}
										>
											{step.label}
										</p>
										{isDone ? (
											<motion.span
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white"
											>
												<HugeiconsIcon icon={Tick02Icon} className="size-2.5" aria-hidden={true} />
											</motion.span>
										) : isActive ? (
											<span className="font-mono text-[9px] text-emerald-600">live</span>
										) : null}
									</div>
									<p className="text-[11px] text-neutral-500">{step.detail}</p>
								</div>
							</motion.li>
						);
					})}
				</ol>

				{phase === "dashboard" ? (
					<motion.p
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-2 text-center font-medium text-[10px] text-emerald-700"
					>
						Full loop complete · restarting demo
					</motion.p>
				) : null}
			</div>
		</div>
	);
}

type WhatsAppPanelProps = {
	visibleCount: number;
	phase: WalkthroughPhaseId;
};

function WhatsAppPanel({ visibleCount, phase }: WhatsAppPanelProps) {
	const messages = WALKTHROUGH_WHATSAPP.slice(0, visibleCount);

	return (
		<div className="rounded-[1.4rem] bg-white/20 p-1.5 shadow-xl ring-1 ring-white/50 backdrop-blur-md">
			<div className="flex flex-col rounded-2xl border border-black/[0.06] bg-white/96 p-4">
				<div className="flex items-center gap-2 border-neutral-100 border-b pb-3">
					<span className="grid size-8 place-items-center rounded-full bg-[#dcf8e8] text-[var(--school-whatsapp)]">
						<HugeiconsIcon icon={WhatsappIcon} className="size-4" aria-hidden={true} />
					</span>
					<div>
						<p className="font-semibold text-neutral-900 text-sm">Parent · WhatsApp</p>
						<p className="flex items-center gap-1.5 text-[11px] text-neutral-500">
							<span
								className={cn(
									"size-1.5 rounded-full",
									visibleCount > 0 ? "bg-emerald-500" : "bg-neutral-300",
								)}
							/>
							{visibleCount > 0 ? "Message delivered" : "Waiting for scan…"}
						</p>
					</div>
				</div>

				<div className="flex min-h-[7.5rem] flex-col gap-2 py-3">
					<AnimatePresence initial={false}>
						{messages.map((message, index) => (
							<motion.div
								key={message.text}
								initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
								animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
								exit={{ opacity: 0, y: -6 }}
								transition={{ duration: 0.4, delay: index * 0.05, ease: ATLAS_EASE }}
								className={
									message.role === "user"
										? "ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-[#dcf8e8] px-3 py-2 text-neutral-800 text-[11px] leading-5"
										: "flex max-w-[92%] items-start gap-2 self-start"
								}
							>
								{message.role === "agent" ? (
									<>
										<span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#dcf8e8] text-[var(--school-whatsapp)]">
											<HugeiconsIcon icon={WhatsappIcon} className="size-3" aria-hidden={true} />
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
					</AnimatePresence>

					{visibleCount === 0 ? (
						<p className="m-auto text-[11px] text-neutral-400 italic">
							Parent alert appears after mark present
						</p>
					) : null}
				</div>

				<div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
					<span className="text-[11px] text-neutral-400">
						{phase === "notify" ? "Sending utility template…" : "Ask about attendance or fees…"}
					</span>
					<span className="ml-auto grid size-6 place-items-center rounded-full bg-[var(--school-whatsapp)] text-white">
						<HugeiconsIcon icon={SentIcon} className="size-3" aria-hidden={true} />
					</span>
				</div>
			</div>
		</div>
	);
}

type DashboardStripProps = {
	show: boolean;
	reduceMotion: boolean;
};

function DashboardStrip({ show, reduceMotion }: DashboardStripProps) {
	return (
		<AnimatePresence>
			{show ? (
				<motion.div
					key="dashboard"
					initial={reduceMotion ? false : { opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					transition={{ duration: 0.35, ease: ATLAS_EASE }}
					className="overflow-hidden rounded-[1.4rem] bg-white/20 p-1.5 shadow-xl ring-1 ring-white/50 backdrop-blur-md"
				>
					<div className="flex items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-white/96 px-4 py-3">
						<div>
							<p className="font-semibold text-neutral-900 text-xs">Principal dashboard</p>
							<p className="text-[10px] text-neutral-500">Morning counts · live</p>
						</div>
						<div className="flex gap-3">
							<StatPill label="Present" value={247} highlight reduceMotion={reduceMotion} />
							<StatPill label="Absent" value={3} reduceMotion={reduceMotion} />
							<StatPill label="Late" value={1} reduceMotion={reduceMotion} />
						</div>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}

type StatPillProps = {
	label: string;
	value: number;
	highlight?: boolean;
	reduceMotion: boolean;
};

function StatPill({ label, value, highlight, reduceMotion }: StatPillProps) {
	return (
		<div className="text-center">
			<motion.p
				key={value}
				initial={reduceMotion || !highlight ? false : { scale: 0.85, opacity: 0.5 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ type: "spring", stiffness: 400, damping: 24 }}
				className={cn(
					"font-serif text-lg tabular-nums tracking-tight",
					highlight ? "text-emerald-700" : "text-neutral-800",
				)}
			>
				{value}
			</motion.p>
			<p className="text-[9px] text-neutral-500 uppercase tracking-wide">{label}</p>
		</div>
	);
}
