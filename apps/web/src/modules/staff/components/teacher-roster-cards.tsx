"use client";

import { Skeleton } from "@school-os/ui/components/skeleton";
import { cn } from "@/lib/utils";
import type { TeacherSummary } from "../types/staff.types";
import { TeacherIdCard } from "./teacher-id-card";

type Props = {
	teachers: TeacherSummary[];
	schoolName: string;
	tenantId: string;
	campusNameById: Map<string, string>;
	loading?: boolean;
	className?: string;
};

export function TeacherRosterCards({
	teachers,
	schoolName,
	tenantId,
	campusNameById,
	loading,
	className,
}: Props) {
	if (loading) {
		return (
			<div
				className={cn("grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", className)}
			>
				{["c1", "c2", "c3", "c4", "c5", "c6"].map((key) => (
					<Skeleton key={key} className="h-[240px] rounded-2xl" />
				))}
			</div>
		);
	}

	if (teachers.length === 0) {
		return (
			<div
				className={cn("flex h-40 flex-col items-center justify-center px-4 text-center", className)}
			>
				<p className="font-medium text-foreground">No teachers found</p>
				<p className="mt-1 max-w-sm text-muted-foreground text-sm">
					Invite teachers from Members, then return here to view their staff cards.
				</p>
			</div>
		);
	}

	return (
		<div className={cn("grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", className)}>
			{teachers.map((teacher) => (
				<TeacherIdCard
					key={teacher.membershipId}
					teacher={teacher}
					schoolName={schoolName}
					tenantId={tenantId}
					campusName={teacher.campusId ? campusNameById.get(teacher.campusId) : undefined}
					className="mx-auto w-full"
				/>
			))}
		</div>
	);
}
