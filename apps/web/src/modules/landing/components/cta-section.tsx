"use client";

import { ArrowRight01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { DEPLOY_TERMINAL, docsHref, SITE } from "../data/landing.data";
import { ATLAS_EASE, hoverTap, springSnappy } from "../lib/motion";
import { FadeIn } from "./fade-in";

export function CtaSection() {
	const [copied, setCopied] = useState(false);
	const command = "bun install";

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(command);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			// Clipboard can fail in insecure contexts — ignore.
		}
	};

	return (
		<section id="deploy" className="w-full px-4 py-20 sm:px-8">
			<div className="relative mx-auto flex w-full max-w-3xl flex-col items-center text-center">
				<FadeIn>
					<span className="inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-1 font-medium text-muted-foreground text-xs backdrop-blur">
						For developers too
					</span>
				</FadeIn>

				<FadeIn delay={0.08}>
					<h2 className="mt-5 max-w-2xl text-balance font-serif text-4xl text-foreground leading-[1.05] sm:text-5xl">
						Clone the repo. Build Phase 1.
					</h2>
				</FadeIn>

				<FadeIn delay={0.12}>
					<p className="mt-5 max-w-xl text-pretty text-muted-foreground text-sm leading-7 sm:text-base">
						School OS is an open monorepo — Next.js, Expo, NestJS, and docs included. Follow the
						production roadmap to ship Smart Attendance on a spine that scales to finance and AI.
					</p>
				</FadeIn>

				<FadeIn delay={0.16} className="mt-9 w-full max-w-xl" y={24}>
					<motion.div
						className="overflow-hidden rounded-2xl border border-border bg-neutral-950 text-left shadow-2xl ring-1 ring-white/5"
						whileHover={{ y: -4 }}
						transition={springSnappy}
					>
						<div className="flex items-center gap-2 border-white/5 border-b bg-white/[0.03] px-4 py-3">
							<span className="size-3 rounded-full bg-[#ff5f57]" />
							<span className="size-3 rounded-full bg-[#febc2e]" />
							<span className="size-3 rounded-full bg-[#28c840]" />
							<span className="ml-2 font-mono text-[11px] text-white/40">~/school-os</span>
							<motion.button
								type="button"
								onClick={handleCopy}
								whileHover={{ scale: 1.04 }}
								whileTap={hoverTap}
								className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-medium text-[11px] text-white/70 transition-colors hover:bg-white/10"
							>
								<HugeiconsIcon icon={Copy01Icon} className="size-3" aria-hidden={true} />
								{copied ? "Copied" : "Copy"}
							</motion.button>
						</div>

						<div className="space-y-2 px-4 py-5 font-mono text-[13px] leading-relaxed sm:px-5">
							{DEPLOY_TERMINAL.map((line, index) => (
								<motion.div
									key={line.text}
									initial={{ opacity: 0, y: 6 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.4, delay: index * 0.12, ease: ATLAS_EASE }}
									className="flex items-start gap-2"
								>
									{line.tone === "prompt" ? (
										<>
											<span className="select-none text-emerald-400">$</span>
											<span className="text-white/90">{line.text}</span>
										</>
									) : (
										<>
											<HugeiconsIcon
												icon={Tick02Icon}
												className="mt-0.5 size-3.5 shrink-0 text-emerald-400"
												aria-hidden="true"
											/>
											<span className="text-white/55">{line.text}</span>
										</>
									)}
								</motion.div>
							))}
						</div>
					</motion.div>
				</FadeIn>

				<FadeIn delay={0.2} className="mt-9 flex flex-wrap items-center justify-center gap-3">
					<motion.div
						whileHover={{ scale: 1.03, y: -2 }}
						whileTap={hoverTap}
						transition={springSnappy}
					>
						<a
							href={SITE.githubUrl}
							target="_blank"
							rel="noreferrer noopener"
							className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Clone on GitHub
							<HugeiconsIcon icon={ArrowRight01Icon} className="size-4" aria-hidden={true} />
						</a>
					</motion.div>
					<motion.div
						whileHover={{ scale: 1.03, y: -2 }}
						whileTap={hoverTap}
						transition={springSnappy}
					>
						<Link
							href={docsHref()}
							className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-base font-medium text-foreground transition-colors hover:border-border"
						>
							Read the docs
						</Link>
					</motion.div>
				</FadeIn>
			</div>
		</section>
	);
}
