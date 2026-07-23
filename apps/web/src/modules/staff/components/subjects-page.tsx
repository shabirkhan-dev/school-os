"use client";

import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { Spinner } from "@school-os/ui/components/spinner";
import { useState } from "react";
import { AcademicPageShell } from "@/modules/academic/components/academic-page-shell";
import {
	useCreateSubjectMutation,
	useSubjectsQuery,
} from "@/modules/staff/hooks/use-staff-queries";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";

export function SubjectsPage() {
	const { activeTenant } = useTenantContext();
	const { can } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const canRead = can(PermissionCodes.STAFF_READ);
	const canWrite = can(PermissionCodes.STAFF_WRITE);

	const subjectsQuery = useSubjectsQuery(tenantId, canRead);
	const createSubject = useCreateSubjectMutation(tenantId ?? "");

	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [error, setError] = useState<string | null>(null);

	function resetForm() {
		setCode("");
		setName("");
		setDescription("");
		setError(null);
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!tenantId || !canWrite) return;
		setError(null);
		try {
			await createSubject.mutateAsync({
				code,
				name,
				description: description || undefined,
			});
			resetForm();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create subject");
		}
	}

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage subjects.</AlertDescription>
			</Alert>
		);
	}

	return (
		<AcademicPageShell
			title="Subjects"
			description="Subject catalog used when assigning teachers to sections."
		>
			{canWrite ? (
				<form
					onSubmit={handleSubmit}
					className="mb-6 rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4"
				>
					<h2 className="mb-3 font-medium text-[14px] text-dashboard-text-primary">Add subject</h2>
					<FieldGroup className="grid gap-3 sm:grid-cols-2">
						<Field>
							<FieldLabel htmlFor="subject-code">Code</FieldLabel>
							<Input
								id="subject-code"
								value={code}
								onChange={(e) => setCode(e.target.value)}
								placeholder="MATH"
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="subject-name">Name</FieldLabel>
							<Input
								id="subject-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Mathematics"
								required
							/>
						</Field>
						<Field className="sm:col-span-2">
							<FieldLabel htmlFor="subject-description">Description</FieldLabel>
							<Input
								id="subject-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Optional short description"
							/>
						</Field>
					</FieldGroup>
					{error ? <p className="mt-3 text-[12px] text-destructive">{error}</p> : null}
					<div className="mt-4">
						<Button type="submit" disabled={createSubject.isPending}>
							{createSubject.isPending ? <Spinner className="size-4" /> : "Create subject"}
						</Button>
					</div>
				</form>
			) : null}

			{subjectsQuery.isLoading ? (
				<div className="flex justify-center py-10">
					<Spinner />
				</div>
			) : (
				<div className="overflow-hidden rounded-[14px] border border-dashboard-border">
					<table className="w-full text-[13px]">
						<thead className="bg-dashboard-surface-strong text-left text-[11px] text-dashboard-text-muted uppercase">
							<tr>
								<th className="px-4 py-2.5">Code</th>
								<th className="px-4 py-2.5">Name</th>
								<th className="px-4 py-2.5">Description</th>
							</tr>
						</thead>
						<tbody>
							{(subjectsQuery.data ?? []).length === 0 ? (
								<tr>
									<td colSpan={3} className="px-4 py-6 text-dashboard-text-muted">
										No subjects yet. Add your first subject above.
									</td>
								</tr>
							) : (
								(subjectsQuery.data ?? []).map((subject) => (
									<tr key={subject.id} className="border-dashboard-border-subtle border-t">
										<td className="px-4 py-3 font-medium">{subject.code}</td>
										<td className="px-4 py-3">{subject.name}</td>
										<td className="px-4 py-3 text-dashboard-text-secondary">
											{subject.description ?? "—"}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			)}
		</AcademicPageShell>
	);
}
