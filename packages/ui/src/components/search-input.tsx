"use client";

import { Search01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@school-os/ui/components/input-group";
import { cn } from "@school-os/ui/lib/utils";
import type * as React from "react";

export type SearchInputProps = {
	id?: string;
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	placeholder?: string;
	className?: string;
	inputRef?: React.Ref<HTMLInputElement>;
	showShortcut?: boolean;
	shortcutLabel?: string;
	"aria-label"?: string;
};

export function SearchInput({
	id,
	value,
	defaultValue,
	onValueChange,
	placeholder = "Search…",
	className,
	inputRef,
	showShortcut = false,
	shortcutLabel = "⌘K",
	"aria-label": ariaLabel,
}: SearchInputProps) {
	return (
		<InputGroup className={cn("h-9", className)}>
			<InputGroupAddon align="inline-start">
				<HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
			</InputGroupAddon>
			<InputGroupInput
				ref={inputRef}
				id={id}
				type="search"
				aria-label={ariaLabel ?? placeholder}
				placeholder={placeholder}
				value={value}
				defaultValue={defaultValue}
				onChange={(event) => onValueChange?.(event.target.value)}
				className="text-[13px]"
			/>
			{showShortcut ? (
				<InputGroupAddon align="inline-end">
					<InputGroupText>
						<kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground">
							{shortcutLabel}
						</kbd>
					</InputGroupText>
				</InputGroupAddon>
			) : null}
		</InputGroup>
	);
}
