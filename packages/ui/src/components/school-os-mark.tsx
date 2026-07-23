import { cn } from "../lib/utils";

type SchoolOsMarkProps = {
	className?: string;
	src?: string;
};

/** Icon-only mark — cap + shield on green squircle, no wordmark text. */
export function SchoolOsMark({ className, src = "/brand/school-os-mark.png" }: SchoolOsMarkProps) {
	return (
		// biome-ignore lint/performance/noImgElement: transparent brand PNG from public/
		<img src={src} alt="" width={28} height={28} className={cn("size-7 shrink-0", className)} />
	);
}
