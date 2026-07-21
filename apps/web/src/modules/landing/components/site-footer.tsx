"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { FOOTER_COLUMNS, SITE } from "../data/landing.data";

function GitHubIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
			<title>github</title>
			<path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
		</svg>
	);
}

function TwitterIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
			<title>twitter</title>
			<path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.31 17.41Z" />
		</svg>
	);
}

function LinkedInIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
			<title>linkedin</title>
			<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0Z" />
		</svg>
	);
}

const SOCIALS = [
	{ label: "GitHub", href: "#", icon: GitHubIcon },
	{ label: "Twitter", href: "#", icon: TwitterIcon },
	{ label: "LinkedIn", href: "#", icon: LinkedInIcon },
] as const;

export function SiteFooter() {
	const [email, setEmail] = useState("");
	const [subscribed, setSubscribed] = useState(false);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (email.trim().length === 0) {
			return;
		}
		setSubscribed(true);
		setEmail("");
	};

	return (
		<footer className="relative w-full overflow-hidden bg-background">
			<div className="mx-auto w-full max-w-6xl px-4 pt-16 pb-8 sm:px-8">
				<div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
					<div className="flex flex-col">
						<span className="text-foreground font-semibold text-xl tracking-tight">
							{SITE.name}
						</span>
						<p className="mt-3 max-w-xs text-muted-foreground text-sm leading-6">
							{SITE.description}
						</p>
						<span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground text-xs">
							<span className="relative flex size-2">
								<span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500/70" />
								<span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
							</span>
							Phase 1 in progress
						</span>

						<div className="mt-8">
							<p className="font-medium text-foreground text-sm">Release notes</p>
							<p className="mt-1 text-muted-foreground text-sm">
								What landed in School OS this month. Once a month, no noise.
							</p>
							<form
								onSubmit={handleSubmit}
								className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center"
							>
								<label htmlFor="school-os-newsletter" className="sr-only">
									Email address
								</label>
								<input
									id="school-os-newsletter"
									type="email"
									required
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									placeholder="you@school.dev"
									className="h-12 w-full flex-1 appearance-none rounded-full border border-border bg-background px-5 text-foreground text-sm shadow-none outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/40"
								/>
								<button
									type="submit"
									className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
								>
									{subscribed ? "Subscribed" : "Subscribe"}
								</button>
							</form>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
						{FOOTER_COLUMNS.map((column) => (
							<div key={column.title} className="flex flex-col">
								<p className="font-medium text-foreground text-sm">{column.title}</p>
								<ul className="mt-4 flex flex-col gap-3">
									{column.links.map((link) => (
										<li key={link.label}>
											<Link
												href={link.href}
												className="inline-flex w-fit items-center text-foreground text-sm opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:underline focus-visible:underline-offset-4 focus-visible:opacity-100"
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				<div className="mt-14 flex flex-col-reverse items-center gap-6 border-border border-t pt-8 sm:flex-row sm:justify-between">
					<p className="text-muted-foreground text-xs">© 2026 beUI Pro. All rights reserved.</p>
					<div className="flex items-center gap-1.5">
						{SOCIALS.map(({ label, href, icon: Icon }) => (
							<a
								key={label}
								href={href}
								aria-label={label}
								target="_blank"
								rel="noreferrer noopener"
								className="grid size-10 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
							>
								<Icon className="size-[1.05rem]" />
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
