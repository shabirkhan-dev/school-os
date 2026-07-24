"use client";

import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { Spinner } from "@school-os/ui/components/spinner";
import type { Campus } from "../types/tenant.types";

type CampusListProps = {
	campuses: Campus[];
	loading?: boolean;
	activeCampusId?: string | null;
	onSelect?: (campusId: string) => void;
};

export function CampusList({ campuses, loading, activeCampusId, onSelect }: CampusListProps) {
	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Spinner className="size-6 text-dashboard-accent" />
			</div>
		);
	}

	if (campuses.length === 0) {
		return (
			<div className="rounded-[16px] border border-dashed border-dashboard-border bg-dashboard-surface px-6 py-10 text-center">
				<p className="font-medium text-dashboard-text-secondary">No campuses yet</p>
				<p className="mt-1 text-[13px] text-dashboard-text-muted">
					Add your first campus to start operating in School OS.
				</p>
			</div>
		);
	}

	return (
		<ul className="divide-y divide-dashboard-border overflow-hidden rounded-[16px] border border-dashboard-border bg-dashboard-surface">
			{campuses.map((campus) => {
				const active = campus.id === activeCampusId;
				return (
					<li key={campus.id}>
						<Button
							variant="ghost"
							onClick={() => onSelect?.(campus.id)}
							className="h-auto w-full items-start justify-start gap-4 rounded-none px-4 py-4 text-left whitespace-normal hover:bg-dashboard-hover"
						>
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dashboard-accent-soft font-bold text-[13px] text-dashboard-accent">
								{campus.code.slice(0, 2)}
							</div>
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-medium text-[14px] text-dashboard-text-primary">
										{campus.name}
									</span>
									<Badge variant="outline" className="font-mono text-[11px]">
										{campus.code}
									</Badge>
									{active ? (
										<Badge className="bg-dashboard-accent-soft text-dashboard-accent">Active</Badge>
									) : null}
								</div>
								{campus.address ? (
									<p className="mt-1 text-[12px] text-dashboard-text-muted">{campus.address}</p>
								) : null}
							</div>
						</Button>
					</li>
				);
			})}
		</ul>
	);
}
