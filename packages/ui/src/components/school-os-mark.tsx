import { cn } from "../lib/utils";

type SchoolOsMarkProps = {
	className?: string;
	src?: string;
};

export function SchoolOsMark({ className, src = "/brand/school-os-mark.png" }: SchoolOsMarkProps) {
	return (
		// biome-ignore lint/performance/noImgElement: brand PNG from public/; shared outside Next Image
		<img src={src} alt="" className={cn("size-7 shrink-0 rounded-lg", className)} />
	);
}
