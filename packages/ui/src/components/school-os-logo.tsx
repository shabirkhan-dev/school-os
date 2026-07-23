import { cn } from "../lib/utils";

type SchoolOsLogoProps = {
	className?: string;
};

export function SchoolOsLogo({ className }: SchoolOsLogoProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 200 40"
			fill="none"
			role="img"
			aria-label="School OS"
			className={cn("h-7 w-auto shrink-0", className)}
		>
			<rect width="32" height="32" x="0" y="4" rx="8" fill="#0a6847" />
			<path
				d="M16 12.5L8 16.25v1.5c0 4.2 3.4 7.6 8 8.75 4.6-1.15 8-4.55 8-8.75v-1.5L16 12.5z"
				stroke="#f6fdf9"
				strokeWidth="1.6"
				strokeLinejoin="round"
				transform="translate(0 4)"
			/>
			<path
				d="M16 12.5v12.5"
				stroke="#f6fdf9"
				strokeWidth="1.6"
				strokeLinecap="round"
				transform="translate(0 4)"
			/>
			<path
				d="M11.5 18.5c0-1.2 2-2 4.5-2s4.5.8 4.5 2"
				stroke="#f6fdf9"
				strokeWidth="1.6"
				strokeLinecap="round"
				transform="translate(0 4)"
			/>
			<text
				x="44"
				y="27"
				fill="currentColor"
				className="fill-foreground"
				fontFamily="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif"
				fontSize="20"
				fontWeight="600"
				letterSpacing="-0.02em"
			>
				School OS
			</text>
		</svg>
	);
}
