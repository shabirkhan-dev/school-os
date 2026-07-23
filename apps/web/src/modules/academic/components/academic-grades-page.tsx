"use client";

import { Delete02Icon, Edit02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { Spinner } from "@school-os/ui/components/spinner";
import { useState } from "react";
import {
	useClassesQuery,
	useCreateClassMutation,
	useDeleteClassMutation,
	useUpdateClassMutation,
} from "@/modules/academic/hooks/use-academic-queries";
import type { SchoolClass } from "@/modules/academic/types/academic.types";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";
import { AcademicPageShell } from "./academic-page-shell";

export function AcademicGradesPage() {
	const { activeTenant } = useTenantContext();
	const { can } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const canRead = can(PermissionCodes.ACADEMIC_READ);
	const canWrite = can(PermissionCodes.ACADEMIC_WRITE);

	const classesQuery = useClassesQuery(tenantId, canRead);
	const createClass = useCreateClassMutation(tenantId ?? "");
	const updateClass = useUpdateClassMutation(tenantId ?? "");
	const deleteClass = useDeleteClassMutation(tenantId ?? "");

	const [editing, setEditing] = useState<SchoolClass | null>(null);
	const [name, setName] = useState("");
	const [sortOrder, setSortOrder] = useState("0");
	const [error, setError] = useState<string | null>(null);

	function resetForm() {
		setEditing(null);
		setName("");
		setSortOrder("0");
		setError(null);
	}

	function startEdit(item: SchoolClass) {
		setEditing(item);
		setName(item.name);
		setSortOrder(String(item.sortOrder));
		setError(null);
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!tenantId || !canWrite) return;
		setError(null);
		const order = Number.parseInt(sortOrder, 10);
		try {
			if (editing) {
				await updateClass.mutateAsync({
					classId: editing.id,
					input: { name, sortOrder: Number.isNaN(order) ? 0 : order },
				});
			} else {
				await createClass.mutateAsync({
					name,
					sortOrder: Number.isNaN(order) ? 0 : order,
				});
			}
			resetForm();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save grade");
		}
	}

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage grades.</AlertDescription>
			</Alert>
		);
	}

	return (
		<AcademicPageShell
			title="Grades"
			description="Grade levels (classes) are reused when you create sections and enroll students."
		>
			{canWrite ? (
				<form
					onSubmit={handleSubmit}
					className="mb-6 rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4"
				>
					<h2 className="mb-3 font-medium text-[14px] text-dashboard-text-primary">
						{editing ? "Edit grade" : "Add grade"}
					</h2>
					<FieldGroup className="grid gap-3 sm:grid-cols-2">
						<Field>
							<FieldLabel htmlFor="grade-name">Name</FieldLabel>
							<Input
								id="grade-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Grade 5"
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="grade-order">Sort order</FieldLabel>
							<Input
								id="grade-order"
								type="number"
								min={0}
								value={sortOrder}
								onChange={(e) => setSortOrder(e.target.value)}
							/>
						</Field>
					</FieldGroup>
					{error ? <p className="mt-3 text-[12px] text-destructive">{error}</p> : null}
					<div className="mt-4 flex gap-2">
						<Button type="submit" disabled={createClass.isPending || updateClass.isPending}>
							{createClass.isPending || updateClass.isPending ? (
								<Spinner className="size-4" />
							) : editing ? (
								"Save changes"
							) : (
								"Create grade"
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

			{classesQuery.isLoading ? (
				<div className="flex justify-center py-10">
					<Spinner />
				</div>
			) : (
				<div className="overflow-hidden rounded-[14px] border border-dashboard-border">
					<table className="w-full text-[13px]">
						<thead className="bg-dashboard-surface-strong text-left text-[11px] text-dashboard-text-muted uppercase">
							<tr>
								<th className="px-4 py-2.5">Name</th>
								<th className="px-4 py-2.5">Sort</th>
								{canWrite ? <th className="px-4 py-2.5 text-right">Actions</th> : null}
							</tr>
						</thead>
						<tbody>
							{(classesQuery.data ?? []).map((item) => (
								<tr key={item.id} className="border-dashboard-border-subtle border-t">
									<td className="px-4 py-3 font-medium">{item.name}</td>
									<td className="px-4 py-3 tabular-nums text-dashboard-text-secondary">
										{item.sortOrder}
									</td>
									{canWrite ? (
										<td className="px-4 py-3">
											<div className="flex justify-end gap-1">
												<Button
													type="button"
													size="icon-sm"
													variant="outline"
													aria-label={`Edit ${item.name}`}
													onClick={() => startEdit(item)}
												>
													<HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
												</Button>
												<Button
													type="button"
													size="icon-sm"
													variant="outline"
													aria-label={`Delete ${item.name}`}
													onClick={() =>
														void deleteClass.mutateAsync(item.id).catch(() => undefined)
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
