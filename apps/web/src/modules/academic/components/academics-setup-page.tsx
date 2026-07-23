"use client";

import { Mortarboard01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@school-os/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { Spinner } from "@school-os/ui/components/spinner";
import { useState } from "react";
import {
	useAcademicYearsQuery,
	useClassesQuery,
	useCreateAcademicYearMutation,
	useCreateClassMutation,
	useCreateSectionMutation,
	useSectionsQuery,
} from "@/modules/academic";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";

export function AcademicsSetupPage() {
	const { activeTenant, activeCampus, campuses } = useTenantContext();
	const { can } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const campusId = activeCampus?.id ?? campuses[0]?.id ?? null;
	const canWrite = can(PermissionCodes.ACADEMIC_WRITE);

	const yearsQuery = useAcademicYearsQuery(tenantId, can(PermissionCodes.ACADEMIC_READ));
	const classesQuery = useClassesQuery(tenantId, can(PermissionCodes.ACADEMIC_READ));
	const sectionsQuery = useSectionsQuery(tenantId, campusId, can(PermissionCodes.ACADEMIC_READ));

	const createYear = useCreateAcademicYearMutation(tenantId ?? "");
	const createClass = useCreateClassMutation(tenantId ?? "");
	const createSection = useCreateSectionMutation(tenantId ?? "");

	const [yearName, setYearName] = useState("");
	const [className, setClassName] = useState("");
	const [sectionName, setSectionName] = useState("");
	const [selectedYearId, setSelectedYearId] = useState("");
	const [selectedClassId, setSelectedClassId] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to set up academics.</AlertDescription>
			</Alert>
		);
	}

	async function handleCreateYear(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		setMessage(null);
		try {
			await createYear.mutateAsync({
				name: yearName,
				startsOn: "2026-04-01",
				endsOn: "2027-03-31",
				status: "active",
			});
			setYearName("");
			setMessage("Academic year created");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create academic year");
		}
	}

	async function handleCreateClass(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		setMessage(null);
		try {
			await createClass.mutateAsync({ name: className });
			setClassName("");
			setMessage("Class created");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create class");
		}
	}

	async function handleCreateSection(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		setMessage(null);
		if (!campusId || !selectedYearId || !selectedClassId) {
			setError("Select a campus, academic year, and class first");
			return;
		}
		try {
			await createSection.mutateAsync({
				campusId,
				academicYearId: selectedYearId,
				classId: selectedClassId,
				name: sectionName,
			});
			setSectionName("");
			setMessage("Section created");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create section");
		}
	}

	return (
		<div className="space-y-6">
			<header className="border-dashboard-border border-b pb-5">
				<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
					<HugeiconsIcon icon={Mortarboard01Icon} size={20} strokeWidth={1.8} />
				</div>
				<h1 className="font-semibold text-[24px] text-dashboard-text-primary">Academics</h1>
				<p className="mt-1 max-w-2xl text-[13px] text-dashboard-text-muted">
					Define academic years, grade levels, and sections for {activeTenant?.name}.
				</p>
			</header>

			{error ? (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}
			{message ? (
				<Alert>
					<AlertDescription>{message}</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-6 lg:grid-cols-2">
				<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
					<CardHeader>
						<CardTitle className="text-lg">Academic years</CardTitle>
						<CardDescription>One active year per organization.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<ul className="space-y-2 text-sm">
							{(yearsQuery.data ?? []).map((year) => (
								<li
									key={year.id}
									className="rounded-md border border-dashboard-border/70 px-3 py-2"
								>
									<span className="font-medium">{year.name}</span>
									<span className="ml-2 text-dashboard-text-muted">{year.status}</span>
								</li>
							))}
						</ul>
						{canWrite ? (
							<form onSubmit={(e) => void handleCreateYear(e)}>
								<FieldGroup className="gap-3">
									<Field>
										<FieldLabel htmlFor="year-name">Year name</FieldLabel>
										<Input
											id="year-name"
											className="h-9"
											value={yearName}
											onChange={(e) => setYearName(e.target.value)}
											placeholder="2026–27"
											required
										/>
									</Field>
									<Button type="submit" disabled={createYear.isPending}>
										{createYear.isPending ? <Spinner className="size-4" /> : "Add year"}
									</Button>
								</FieldGroup>
							</form>
						) : null}
					</CardContent>
				</Card>

				<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
					<CardHeader>
						<CardTitle className="text-lg">Grade levels</CardTitle>
						<CardDescription>Classes such as Grade 7 or Year 10.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<ul className="space-y-2 text-sm">
							{(classesQuery.data ?? []).map((item) => (
								<li
									key={item.id}
									className="rounded-md border border-dashboard-border/70 px-3 py-2"
								>
									{item.name}
								</li>
							))}
						</ul>
						{canWrite ? (
							<form onSubmit={(e) => void handleCreateClass(e)}>
								<FieldGroup className="gap-3">
									<Field>
										<FieldLabel htmlFor="class-name">Class name</FieldLabel>
										<Input
											id="class-name"
											className="h-9"
											value={className}
											onChange={(e) => setClassName(e.target.value)}
											placeholder="Grade 7"
											required
										/>
									</Field>
									<Button type="submit" disabled={createClass.isPending}>
										{createClass.isPending ? <Spinner className="size-4" /> : "Add class"}
									</Button>
								</FieldGroup>
							</form>
						) : null}
					</CardContent>
				</Card>
			</div>

			<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
				<CardHeader>
					<CardTitle className="text-lg">Sections</CardTitle>
					<CardDescription>
						Sections belong to a campus, class, and academic year (e.g. 7-B).
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<ul className="space-y-2 text-sm">
						{(sectionsQuery.data ?? []).map((section) => (
							<li
								key={section.id}
								className="rounded-md border border-dashboard-border/70 px-3 py-2"
							>
								<span className="font-medium">{section.name}</span>
							</li>
						))}
					</ul>
					{canWrite ? (
						<form onSubmit={(e) => void handleCreateSection(e)}>
							<FieldGroup className="gap-3">
								<div className="grid gap-3 sm:grid-cols-2">
									<Field>
										<FieldLabel htmlFor="section-year">Academic year</FieldLabel>
										<select
											id="section-year"
											className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
											value={selectedYearId}
											onChange={(e) => setSelectedYearId(e.target.value)}
											required
										>
											<option value="">Select year</option>
											{(yearsQuery.data ?? []).map((year) => (
												<option key={year.id} value={year.id}>
													{year.name}
												</option>
											))}
										</select>
									</Field>
									<Field>
										<FieldLabel htmlFor="section-class">Class</FieldLabel>
										<select
											id="section-class"
											className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
											value={selectedClassId}
											onChange={(e) => setSelectedClassId(e.target.value)}
											required
										>
											<option value="">Select class</option>
											{(classesQuery.data ?? []).map((item) => (
												<option key={item.id} value={item.id}>
													{item.name}
												</option>
											))}
										</select>
									</Field>
								</div>
								<Field>
									<FieldLabel htmlFor="section-name">Section name</FieldLabel>
									<Input
										id="section-name"
										className="h-9"
										value={sectionName}
										onChange={(e) => setSectionName(e.target.value)}
										placeholder="7-B"
										required
									/>
								</Field>
								<Button type="submit" disabled={createSection.isPending}>
									{createSection.isPending ? <Spinner className="size-4" /> : "Add section"}
								</Button>
							</FieldGroup>
						</form>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
