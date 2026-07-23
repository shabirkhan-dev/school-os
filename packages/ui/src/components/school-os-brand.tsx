import { cn } from "../lib/utils";
import { SchoolOsMark } from "./school-os-mark";

type SchoolOsBrandProps = {
	className?: string;
	markClassName?: string;
	name?: string;
	nameClassName?: string;
};

/** Mark icon + separate wordmark text (text is not baked into the image). */
export function SchoolOsBrand({
	className,
	markClassName,
	name = "School OS",
	nameClassName,
}: SchoolOsBrandProps) {
	return (
		<span className={cn("inline-flex items-center gap-2.5", className)}>
			<SchoolOsMark className={markClassName} />
			<span className={cn("font-semibold text-foreground tracking-tight", nameClassName)}>
				{name}
			</span>
		</span>
	);
}
