"use client";

import { BookOpen02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@school-os/ui/components/badge";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useHomeworkListQuery } from "@/modules/homework/hooks/use-homework-queries";
import { PermissionCodes, usePermissions } from "@/modules/tenants";

type Props = {
	tenantId: string;
	studentId: string;
	studentName: string;
};

function formatDueDate(value: string | null) {
	if (!value) return "No due date";
	return new Date(value).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

export function ParentChildHomeworkPanel({ tenantId, studentId, studentName }: Props) {
	const { can } = usePermissions();
	const canRead = can(PermissionCodes.HOMEWORK_READ);
	const homeworkQuery = useHomeworkListQuery(tenantId, { studentId, status: "published" }, canRead);

	if (!canRead) return null;

	return (
		<section className="mt-4 rounded-xl border border-dashboard-border bg-dashboard-surface/50 p-4">
			<div className="mb-3 flex items-center gap-2">
				<HugeiconsIcon
					icon={BookOpen02Icon}
					size={18}
					strokeWidth={2}
					className="text-dashboard-accent"
				/>
				<h3 className="font-medium text-sm">Homework for {studentName}</h3>
			</div>

			{homeworkQuery.isLoading ? (
				<div className="flex justify-center py-6">
					<Spinner className="size-5" />
				</div>
			) : (homeworkQuery.data ?? []).length === 0 ? (
				<p className="text-[13px] text-dashboard-text-muted">No published homework right now.</p>
			) : (
				<ul className="space-y-2">
					{homeworkQuery.data?.map((item) => (
						<li key={item.id}>
							<Link
								href={`/admin/homework/${item.id}`}
								className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-muted/30"
							>
								<div className="min-w-0">
									<p className="truncate font-medium text-sm">{item.title}</p>
									<p className="text-[12px] text-muted-foreground">
										{item.subjectName} · Due {formatDueDate(item.dueAt)}
									</p>
								</div>
								<Badge variant="secondary" className="shrink-0 capitalize">
									{item.status}
								</Badge>
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
