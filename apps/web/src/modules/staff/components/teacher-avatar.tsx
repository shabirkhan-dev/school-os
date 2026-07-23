"use client";

import { cn } from "@/lib/utils";
import type { TeacherSummary } from "../types/staff.types";
import { teacherInitials } from "../utils/teacher-ui.utils";

type Props = {
	teacher: Pick<TeacherSummary, "username" | "email">;
	size?: "sm" | "md" | "lg";
	className?: string;
};

const sizeClasses = {
	sm: "size-8 text-[11px] rounded-lg",
	md: "size-12 text-[13px] rounded-xl",
	lg: "size-20 text-[22px] rounded-2xl",
};

export function TeacherAvatar({ teacher, size = "md", className }: Props) {
	return (
		<span
			aria-hidden
			className={cn(
				"inline-flex shrink-0 items-center justify-center bg-indigo-500/10 font-semibold text-indigo-700 ring-1 ring-indigo-500/20 dark:text-indigo-300",
				sizeClasses[size],
				className,
			)}
		>
			{teacherInitials(teacher)}
		</span>
	);
}
