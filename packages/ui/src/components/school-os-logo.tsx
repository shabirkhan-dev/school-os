import { cn } from "../lib/utils";

type SchoolOsLogoProps = {
	className?: string;
	src?: string;
};

export function SchoolOsLogo({ className, src = "/brand/school-os-logo.png" }: SchoolOsLogoProps) {
	return (
		// biome-ignore lint/performance/noImgElement: brand PNG from public/; shared outside Next Image
		<img src={src} alt="School OS" className={cn("h-7 w-auto shrink-0", className)} />
	);
}
