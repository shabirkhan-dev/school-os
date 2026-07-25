import { cn } from "@school-os/ui/lib/utils";
import type * as React from "react";

type EmptyStateProps = React.ComponentProps<"div"> & {
	/** Illustration shown inside the soft icon tile (e.g. a HugeiconsIcon). */
	icon?: React.ReactNode;
	/** Extra classes for the icon tile, e.g. an accent tint. */
	iconClassName?: string;
	/** Heading text. */
	title: string;
	/** Supporting copy shown under the title. */
	description?: string;
	/** Optional CTA (Button, link, …) rendered under the description. */
	action?: React.ReactNode;
	/** Optional secondary content (chips, hints, …) rendered under the action. */
	footer?: React.ReactNode;
};

/**
 * Centered empty-state surface for lists, grids, and panels.
 *
 * Composable: pass `icon`, `title`, `description`, an optional `action` CTA,
 * and optional `footer` content. Uses semantic tokens only so it inherits
 * whatever theme (and RTL direction) the host app provides.
 */
function EmptyState({
	icon,
	iconClassName,
	title,
	description,
	action,
	footer,
	className,
	...props
}: EmptyStateProps) {
	return (
		<div
			data-slot="empty-state"
			className={cn(
				"border-muted-foreground/25 bg-muted/30 flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-14 text-center",
				className,
			)}
			{...props}
		>
			{icon ? (
				<div
					aria-hidden
					data-slot="empty-state-icon"
					className={cn(
						"bg-muted text-muted-foreground flex size-14 items-center justify-center rounded-2xl [&_svg]:size-6",
						iconClassName,
					)}
				>
					{icon}
				</div>
			) : null}
			<h3 data-slot="empty-state-title" className="mt-5 font-semibold text-base tracking-tight">
				{title}
			</h3>
			{description ? (
				<p
					data-slot="empty-state-description"
					className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed"
				>
					{description}
				</p>
			) : null}
			{action ? (
				<div
					data-slot="empty-state-action"
					className="mt-5 flex flex-wrap items-center justify-center gap-2"
				>
					{action}
				</div>
			) : null}
			{footer ? (
				<div
					data-slot="empty-state-footer"
					className="mt-6 flex flex-wrap items-center justify-center gap-2"
				>
					{footer}
				</div>
			) : null}
		</div>
	);
}

export { EmptyState, type EmptyStateProps };
