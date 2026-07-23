import { cn } from "../lib/utils";

type SchoolOsMarkProps = {
	className?: string;
};

export function SchoolOsMark({ className }: SchoolOsMarkProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 32 32"
			fill="none"
			role="img"
			aria-label="School OS"
			className={cn("size-7 shrink-0 rounded-lg", className)}
		>
			<rect width="32" height="32" rx="8" fill="#0a6847" />
			<path
				d="M16 8.5L8 12.25v1.5c0 4.2 3.4 7.6 8 8.75 4.6-1.15 8-4.55 8-8.75v-1.5L16 8.5z"
				stroke="#f6fdf9"
				strokeWidth="1.6"
				strokeLinejoin="round"
			/>
			<path d="M16 8.5v12.5" stroke="#f6fdf9" strokeWidth="1.6" strokeLinecap="round" />
			<path
				d="M11.5 14.5c0-1.2 2-2 4.5-2s4.5.8 4.5 2"
				stroke="#f6fdf9"
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
		</svg>
	);
}
