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
import { useMemo, useState } from "react";
import {
	useAcademicYearsQuery,
	useClassesQuery,
	useCreateSectionMutation,
	useDeleteSectionMutation,
	useSectionsQuery,
	useUpdateSectionMutation,
} from "@/modules/academic/hooks/use-academic-queries";
import type { Section, SectionStatus } from "@/modules/academic/types/academic.types";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { useTeachersQuery } from "@/modules/staff";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";
import { AcademicPageShell } from "./academic-page-shell";

const statusItems = [
	{ label: "Active", value: "active" },
	{ label: "Inactive", value: "inactive" },
];

export function AcademicSectionsPage() {
	const { activeTenant, activeCampus, campuses } = useTenantContext();
	const { can, isLoading: permissionsLoading } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const campusId = activeCampus?.id ?? campuses[0]?.id ?? null;
	const canRead = can(PermissionCodes.ACADEMIC_READ);
	const canReadStaff = can(PermissionCodes.STAFF_READ);
	const canWrite = can(PermissionCodes.ACADEMIC_WRITE);

	const yearsQuery = useAcademicYearsQuery(tenantId, canRead);
	const classesQuery = useClassesQuery(tenantId, canRead);
	const sectionsQuery = useSectionsQuery(tenantId, campusId, canRead);
	const teachersQuery = useTeachersQuery(tenantId, canReadStaff);
	const createSection = useCreateSectionMutation(tenantId ?? "");
	const updateSection = useUpdateSectionMutation(tenantId ?? "");
	const deleteSection = useDeleteSectionMutation(tenantId ?? "");

	const yearItems = useMemo(
		() => (yearsQuery.data ?? []).map((year) => ({ label: year.name, value: year.id })),
		[yearsQuery.data],
	);
	const classItems = useMemo(
		() => (classesQuery.data ?? []).map((item) => ({ label: item.name, value: item.id })),
		[classesQuery.data],
	);
	const yearNameById = useMemo(
		() => new Map((yearsQuery.data ?? []).map((year) => [year.id, year.name])),
		[yearsQuery.data],
	);
	const classNameById = useMemo(
		() => new Map((classesQuery.data ?? []).map((item) => [item.id, item.name])),
		[classesQuery.data],
	);
	const teacherNameById = useMemo(
		() =>
			new Map((teachersQuery.data ?? []).map((teacher) => [teacher.membershipId, teacher.email])),
		[teachersQuery.data],
	);
	const teacherItems = useMemo(
		() =>
			(teachersQuery.data ?? []).map((teacher) => ({
				label: teacher.email,
				value: teacher.membershipId,
			})),
		[teachersQuery.data],
	);

	const [editing, setEditing] = useState<Section | null>(null);
	const [name, setName] = useState("");
	const [academicYearId, setAcademicYearId] = useState("");
	const [classId, setClassId] = useState("");
	const [status, setStatus] = useState<SectionStatus>("active");
	const [homeroomTeacherId, setHomeroomTeacherId] = useState("");
	const [error, setError] = useState<string | null>(null);

	function resetForm() {
		setEditing(null);
		setName("");
		setAcademicYearId(yearItems[0]?.value ?? "");
		setClassId(classItems[0]?.value ?? "");
		setStatus("active");
		setHomeroomTeacherId("");
		setError(null);
	}

	function startEdit(section: Section) {
		setEditing(section);
		setName(section.name);
		setAcademicYearId(section.academicYearId);
		setClassId(section.classId);
		setStatus(section.status);
		setHomeroomTeacherId(section.homeroomTeacherMembershipId ?? "");
		setError(null);
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!tenantId || !campusId || !canWrite) return;
		setError(null);
		try {
			if (editing) {
				await updateSection.mutateAsync({
					sectionId: editing.id,
					input: {
						name,
						status,
						homeroomTeacherMembershipId: homeroomTeacherId || null,
					},
				});
			} else {
				if (!academicYearId || !classId) {
					setError("Select an academic year and grade");
					return;
				}
				await createSection.mutateAsync({
					campusId,
					academicYearId,
					classId,
					name,
				});
			}
			resetForm();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save section");
		}
	}

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage sections.</AlertDescription>
			</Alert>
		);
	}

	if (!campusId) {
		return (
			<Alert>
				<AlertDescription>Add a campus before creating sections.</AlertDescription>
			</Alert>
		);
	}

	if (permissionsLoading) {
		return (
			<div className="flex min-h-[240px] items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	if (!canRead) {
		return (
			<Alert>
				<AlertDescription>You do not have permission to view academic sections.</AlertDescription>
			</Alert>
		);
	}

	return (
		<AcademicPageShell
			title="Sections"
			description="Sections belong to a campus, academic year, and grade. Switch campus from the sidebar to manage another site."
		>
			{canWrite ? (
				<form
					onSubmit={handleSubmit}
					className="mb-6 rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4"
				>
					<h2 className="mb-3 font-medium text-[14px] text-dashboard-text-primary">
						{editing ? "Edit section" : "Add section"}
					</h2>
					<FieldGroup className="grid gap-3 sm:grid-cols-2">
						<Field className="sm:col-span-2">
							<FieldLabel htmlFor="section-name">Section name</FieldLabel>
							<Input
								id="section-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="5-A"
								required
							/>
						</Field>
						{!editing ? (
							<>
								<Field>
									<FieldLabel htmlFor="section-year">Academic year</FieldLabel>
									<SelectField
										id="section-year"
										value={academicYearId}
										onValueChange={setAcademicYearId}
										items={yearItems}
										placeholder="Select year"
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="section-grade">Grade</FieldLabel>
									<SelectField
										id="section-grade"
										value={classId}
										onValueChange={setClassId}
										items={classItems}
										placeholder="Select grade"
									/>
								</Field>
							</>
						) : (
							<>
								<Field>
									<FieldLabel htmlFor="section-status">Status</FieldLabel>
									<SelectField
										id="section-status"
										value={status}
										onValueChange={(value) => setStatus(value as SectionStatus)}
										items={statusItems}
									/>
								</Field>
								<Field className="sm:col-span-2">
									<FieldLabel htmlFor="section-homeroom">Homeroom teacher</FieldLabel>
									<SelectField
										id="section-homeroom"
										value={homeroomTeacherId}
										onValueChange={setHomeroomTeacherId}
										nullable
										placeholder="No homeroom teacher"
										items={teacherItems}
									/>
								</Field>
							</>
						)}
					</FieldGroup>
					{error ? <p className="mt-3 text-[12px] text-destructive">{error}</p> : null}
					<div className="mt-4 flex gap-2">
						<Button type="submit" disabled={createSection.isPending || updateSection.isPending}>
							{createSection.isPending || updateSection.isPending ? (
								<Spinner className="size-4" />
							) : editing ? (
								"Save changes"
							) : (
								"Create section"
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

			{sectionsQuery.isLoading ? (
				<div className="flex justify-center py-10">
					<Spinner />
				</div>
			) : (
				<div className="overflow-hidden rounded-[14px] border border-dashboard-border">
					<table className="w-full text-[13px]">
						<thead className="bg-dashboard-surface-strong text-left text-[11px] text-dashboard-text-muted uppercase">
							<tr>
								<th className="px-4 py-2.5">Section</th>
								<th className="px-4 py-2.5">Year</th>
								<th className="px-4 py-2.5">Grade</th>
								<th className="px-4 py-2.5">Homeroom</th>
								<th className="px-4 py-2.5">Status</th>
								{canWrite ? <th className="px-4 py-2.5 text-right">Actions</th> : null}
							</tr>
						</thead>
						<tbody>
							{(sectionsQuery.data ?? []).map((section) => (
								<tr key={section.id} className="border-dashboard-border-subtle border-t">
									<td className="px-4 py-3 font-medium">
										{formatSectionLabel(
											section,
											classNameById.get(section.classId),
											campuses.find((campus) => campus.id === section.campusId)?.name,
										)}
									</td>
									<td className="px-4 py-3 text-dashboard-text-secondary">
										{yearNameById.get(section.academicYearId) ?? section.academicYearId}
									</td>
									<td className="px-4 py-3 text-dashboard-text-secondary">
										{classNameById.get(section.classId) ?? "Unknown grade"}
									</td>
									<td className="px-4 py-3 text-dashboard-text-secondary">
										{section.homeroomTeacherMembershipId
											? (teacherNameById.get(section.homeroomTeacherMembershipId) ?? "Assigned")
											: "—"}
									</td>
									<td className="px-4 py-3">
										<Badge variant="outline">{section.status}</Badge>
									</td>
									{canWrite ? (
										<td className="px-4 py-3">
											<div className="flex justify-end gap-1">
												<Button
													type="button"
													size="icon-sm"
													variant="outline"
													aria-label={`Edit ${section.name}`}
													onClick={() => startEdit(section)}
												>
													<HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
												</Button>
												<Button
													type="button"
													size="icon-sm"
													variant="outline"
													aria-label={`Delete ${section.name}`}
													onClick={() =>
														void deleteSection.mutateAsync(section.id).catch(() => undefined)
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
