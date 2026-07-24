"use client";

import { Add01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { SearchInput } from "@school-os/ui/components/search-input";
import { cn } from "@/lib/utils";

type Props = {
	className?: string;
	query: string;
	onQueryChange: (value: string) => void;
	onAdd?: () => void;
};

export function AdmissionsToolbar({ className, query, onQueryChange, onAdd }: Props) {
	return (
		<div className={cn("flex w-full items-center gap-2 sm:w-auto", className)}>
			<SearchInput
				value={query}
				onValueChange={onQueryChange}
				placeholder="Search admissions..."
				aria-label="Search admissions"
				className="min-w-0 flex-1 sm:w-[240px] sm:flex-none"
			/>

			<Button size="sm" className="h-9 shrink-0 gap-1.5" onClick={onAdd} disabled={!onAdd}>
				<HugeiconsIcon icon={Add01Icon} data-icon="inline-start" strokeWidth={2.4} />
				<span className="sm:hidden">Add</span>
				<span className="hidden sm:inline">New admission</span>
			</Button>
		</div>
	);
}
