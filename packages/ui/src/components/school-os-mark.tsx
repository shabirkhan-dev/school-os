import { cn } from "../lib/utils";

type SchoolOsMarkProps = {
	className?: string;
	iconClassName?: string;
};

export function SchoolOsMark({ className, iconClassName }: SchoolOsMarkProps) {
	return (
		<span
			className={cn(
				"relative grid size-7 shrink-0 place-items-center rounded-lg bg-[#0a6847] text-[#f6fdf9] shadow-sm",
				className,
			)}
		>
			<svg
				viewBox="0 0 32 32"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
				className={cn("size-4", iconClassName)}
				aria-hidden="true"
			>
				<title>School OS</title>
				<path d="M16 8.5 8 12.25v1.5c0 4.2 3.4 7.6 8 8.75 4.6-1.15 8-4.55 8-8.75v-1.5L16 8.5z" />
				<path d="M16 8.5v12.5" />
				<path d="M11.5 14.5c0-1.2 2-2 4.5-2s4.5.8 4.5 2" />
			</svg>
		</span>
	);
}
