"use client";

import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";

type MermaidProps = {
	chart: string;
	title?: string;
};

let mermaidInitialized = false;

function initMermaid(): void {
	if (mermaidInitialized) return;
	mermaid.initialize({
		startOnLoad: false,
		theme: "neutral",
		securityLevel: "strict",
		fontFamily: "inherit",
	});
	mermaidInitialized = true;
}

export function Mermaid({ chart, title }: MermaidProps) {
	const id = useId().replace(/:/g, "");
	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		initMermaid();
		const container = containerRef.current;
		if (!container) return;

		let cancelled = false;

		mermaid
			.render(`school-os-mermaid-${id}`, chart.trim())
			.then(({ svg }) => {
				if (!cancelled && container) {
					container.innerHTML = svg;
					setError(null);
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Failed to render diagram");
				}
			});

		return () => {
			cancelled = true;
		};
	}, [chart, id]);

	return (
		<figure className="not-prose my-8 w-full overflow-x-auto rounded-xl border bg-fd-card p-4">
			{title ? (
				<figcaption className="mb-3 text-center font-medium text-fd-muted-foreground text-sm">
					{title}
				</figcaption>
			) : null}
			<div ref={containerRef} className="flex min-h-[4rem] justify-center [&_svg]:max-w-full" />
			{error ? (
				<pre className="mt-2 overflow-x-auto rounded-lg bg-fd-muted p-3 text-fd-muted-foreground text-xs">
					{error}
				</pre>
			) : null}
		</figure>
	);
}
