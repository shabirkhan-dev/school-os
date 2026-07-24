"use client";

import { cn } from "@/lib/utils";
import type { Student } from "../types/student.types";
import { studentInitials } from "../utils/student-ui.utils";

type Props = {
	student: Pick<Student, "firstName" | "lastName">;
	size?: "sm" | "md" | "lg";
	className?: string;
};

const sizeClasses = {
	sm: "size-8 text-[11px] rounded-lg",
	md: "size-12 text-[13px] rounded-xl",
	lg: "size-20 text-[22px] rounded-2xl",
};

export function StudentAvatar({ student, size = "md", className }: Props) {
	return (
		<span
			aria-hidden
			className={cn(
				"inline-flex shrink-0 items-center justify-center bg-muted font-semibold text-foreground ring-1 ring-border",
				sizeClasses[size],
				className,
			)}
		>
			{studentInitials(student)}
		</span>
	);
}
