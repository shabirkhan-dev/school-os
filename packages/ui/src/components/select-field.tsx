"use client";

import { cn } from "@school-os/ui/lib/utils";
import { useMemo } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";

export type SelectFieldItem = {
	label: string;
	value: string;
};

type SelectFieldItemWithNull = {
	label: string;
	value: string | null;
};

export type SelectFieldProps = {
	id?: string;
	"aria-label"?: string;
	value: string;
	onValueChange: (value: string) => void;
	items: SelectFieldItem[];
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	triggerClassName?: string;
	size?: "sm" | "default";
	/** Prepends a null option (maps to empty string in `value` / `onValueChange`). */
	nullable?: boolean;
	alignItemWithTrigger?: boolean;
};

export function SelectField({
	id,
	"aria-label": ariaLabel,
	value,
	onValueChange,
	items,
	placeholder = "Select…",
	disabled,
	className,
	triggerClassName,
	size = "default",
	nullable = false,
	alignItemWithTrigger = false,
}: SelectFieldProps) {
	const selectItems = useMemo((): SelectFieldItemWithNull[] => {
		const mapped = items.map((item) => ({ label: item.label, value: item.value }));
		if (nullable) {
			return [{ label: placeholder, value: null }, ...mapped];
		}
		return mapped;
	}, [items, nullable, placeholder]);

	const selectValue = nullable && value === "" ? null : value;

	return (
		<Select
			items={selectItems}
			value={selectValue}
			onValueChange={(next) => {
				onValueChange(next ?? "");
			}}
			disabled={disabled}
		>
			<SelectTrigger
				id={id}
				aria-label={ariaLabel}
				size={size}
				disabled={disabled}
				className={cn("w-full", triggerClassName, className)}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent alignItemWithTrigger={alignItemWithTrigger} side="bottom">
				<SelectGroup>
					{selectItems.map((item) => (
						<SelectItem key={item.value ?? "__empty__"} value={item.value}>
							{item.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
