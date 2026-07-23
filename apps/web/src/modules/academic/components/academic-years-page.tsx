"use client";

import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { SelectField } from "@school-os/ui/components/select-field";
import { Spinner } from "@school-os/ui/components/spinner";
import { useState } from "react";
import {
	useAcademicYearsQuery,
	useCreateAcademicYearMutation,
	useDeleteAcademicYearMutation,
	useUpdateAcademicYearMutation,
} from "@/modules/academic/hooks/use-academic-queries";
import type { AcademicYear, AcademicYearStatus } from "@/modules/academic/types/academic.types";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";
import { AcademicPageShell } from "./academic-page-shell";

const statusItems = [
	{ label: "Draft", value: "draft" },
	{ label: "Active", value: "active" },
	{ label: "Archived", value: "archived" },
];

export function AcademicYearsPage() {
	const { activeTenant } = useTenantContext();
	const { can } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const canRead = can(PermissionCodes.ACADEMIC_READ);
	const canWrite = can(PermissionCodes.ACADEMIC_WRITE);

	const yearsQuery = useAcademicYearsQuery(tenantId, canRead);
	const createYear = useCreateAcademicYearMutation(tenantId ?? "");
	const updateYear = useUpdateAcademicYearMutation(tenantId ?? "");
	const deleteYear = useDeleteAcademicYearMutation(tenantId ?? "");

	const [editing, setEditing] = useState<AcademicYear | null>(null);
	const [name, setName] = useState("");
	const [startsOn, setStartsOn] = useState("");
	const [endsOn, setEndsOn] = useState("");
	const [status, setStatus] = useState<AcademicYearStatus>("draft");
	const [error, setError] = useState<string | null>(null);

	function resetForm() {
		setEditing(null);
		setName("");
		setStartsOn("");
		setEndsOn("");
		setStatus("draft");
		setError(null);
	}

	function startEdit(year: AcademicYear) {
		setEditing(year);
		setName(year.name);
		setStartsOn(year.startsOn);
		setEndsOn(year.endsOn);
		setStatus(year.status);
		setError(null);
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!tenantId || !canWrite) return;
		setError(null);
		try {
			if (editing) {
				await updateYear.mutateAsync({
					academicYearId: editing.id,
					input: { name, startsOn, endsOn, status },
				});
			} else {
				await createYear.mutateAsync({ name, startsOn, endsOn, status });
			}
			resetForm();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save academic year");
		}
	}

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage academic years.</AlertDescription>
			</Alert>
		);
	}

	return (
		<AcademicPageShell
			title="Academic years"
			description="Create and maintain school years. Only one year can be active at a time."
		>
			{canWrite ? (
				<form
					onSubmit={handleSubmit}
					className="mb-6 rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4"
				>
					<h2 className="mb-3 font-medium text-[14px] text-dashboard-text-primary">
						{editing ? "Edit academic year" : "Add academic year"}
					</h2>
					<FieldGroup className="grid gap-3 sm:grid-cols-2">
						<Field>
							<FieldLabel htmlFor="year-name">Name</FieldLabel>
							<Input
								id="year-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="year-status">Status</FieldLabel>
							<SelectField
								id="year-status"
								value={status}
								onValueChange={(value) => setStatus(value as AcademicYearStatus)}
								items={statusItems}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="year-starts">Starts on</FieldLabel>
							<Input
								id="year-starts"
								type="date"
								value={startsOn}
								onChange={(e) => setStartsOn(e.target.value)}
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="year-ends">Ends on</FieldLabel>
							<Input
								id="year-ends"
								type="date"
								value={endsOn}
								onChange={(e) => setEndsOn(e.target.value)}
								required
							/>
						</Field>
					</FieldGroup>
					{error ? <p className="mt-3 text-[12px] text-destructive">{error}</p> : null}
					<div className="mt-4 flex gap-2">
						<Button type="submit" disabled={createYear.isPending || updateYear.isPending}>
							{createYear.isPending || updateYear.isPending ? (
								<Spinner className="size-4" />
							) : editing ? (
								"Save changes"
							) : (
								"Create year"
							)}
						</Button>
						{editing ? (
							<Button type="button" variant="outline" onClick={resetForm}>
								Cancel
							</Button>
						) : null}
					</div>
				</form>
			) : null}

			{yearsQuery.isLoading ? (
				<div className="flex justify-center py-10">
					<Spinner />
				</div>
			) : (
				<div className="overflow-hidden rounded-[14px] border border-dashboard-border">
					<table className="w-full text-[13px]">
						<thead className="bg-dashboard-surface-strong text-left text-[11px] text-dashboard-text-muted uppercase">
							<tr>
								<th className="px-4 py-2.5">Name</th>
								<th className="px-4 py-2.5">Dates</th>
								<th className="px-4 py-2.5">Status</th>
								{canWrite ? <th className="px-4 py-2.5 text-right">Actions</th> : null}
							</tr>
						</thead>
						<tbody>
							{(yearsQuery.data ?? []).map((year) => (
								<tr key={year.id} className="border-dashboard-border-subtle border-t">
									<td className="px-4 py-3 font-medium">{year.name}</td>
									<td className="px-4 py-3 text-dashboard-text-secondary tabular-nums">
										{year.startsOn} → {year.endsOn}
									</td>
									<td className="px-4 py-3">
										<Badge variant="outline">{year.status}</Badge>
									</td>
									{canWrite ? (
										<td className="px-4 py-3">
											<div className="flex justify-end gap-1">
												<Button
													type="button"
													size="icon-sm"
													variant="outline"
													aria-label={`Edit ${year.name}`}
													onClick={() => startEdit(year)}
												>
													<HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
												</Button>
												<Button
													type="button"
													size="icon-sm"
													variant="outline"
													aria-label={`Delete ${year.name}`}
													onClick={() =>
														void deleteYear.mutateAsync(year.id).catch(() => undefined)
													}
												>
													<HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
												</Button>
											</div>
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</AcademicPageShell>
	);
}
