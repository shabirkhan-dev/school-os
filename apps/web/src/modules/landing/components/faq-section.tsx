"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";
import { FAQ_ITEMS } from "../data/landing.data";
import { FadeIn } from "./fade-in";

export function FaqSection() {
	const items = FAQ_ITEMS.map((item) => ({
		id: item.id,
		title: item.question,
		description: item.answer,
		icon: <HugeiconsIcon icon={item.icon} className="h-4 w-4" strokeWidth={2} />,
	}));

	return (
		<section id="faq" className="w-full px-4 py-20 sm:px-8 sm:py-28">
			<div className="mx-auto w-full max-w-3xl">
				<div className="mb-10 text-center sm:mb-14">
					<FadeIn>
						<span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 font-medium text-foreground/80 text-xs">
							FAQ
						</span>
					</FadeIn>
					<FadeIn delay={0.06}>
						<h2 className="mt-5 text-balance font-serif text-3xl text-foreground leading-[1.15] sm:text-4xl">
							Questions schools and developers ask.
						</h2>
					</FadeIn>
					<FadeIn delay={0.1}>
						<p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground text-sm leading-7 sm:text-base">
							Product positioning, WhatsApp compliance, pilots, and how the open monorepo fits
							together.
						</p>
					</FadeIn>
				</div>

				<FadeIn delay={0.14} y={24}>
					<BouncyAccordion
						items={items}
						defaultValue="erp"
						classNames={{
							item: "border border-border/60 bg-card/80 shadow-none",
							trigger: "items-start py-4 hover:bg-muted/20",
							title: "overflow-visible whitespace-normal text-clip leading-snug",
							icon: "mt-0.5",
							chevron: "mt-0.5",
							description: "text-sm leading-6 sm:text-[15px]",
						}}
					/>
				</FadeIn>
			</div>
		</section>
	);
}
