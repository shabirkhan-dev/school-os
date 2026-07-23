"use client";

import { StudentIcon } from "@hugeicons/core-free-icons";
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
import { SelectField } from "@school-os/ui/components/select-field";
import { Spinner } from "@school-os/ui/components/spinner";
import { useMemo, useState } from "react";
import { useAcademicYearsQuery, useSectionsQuery } from "@/modules/academic";
import {
	useCreateEnrollmentMutation,
	useCreateStudentMutation,
	useStudentEnrollmentsQuery,
	useStudentsQuery,
} from "@/modules/students";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";

export function StudentsPage() {
	const { activeTenant, activeCampus, campuses } = useTenantContext();
	const { can } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const campusId = activeCampus?.id ?? campuses[0]?.id ?? null;
	const canWrite = can(PermissionCodes.STUDENTS_WRITE);
	const canRead = can(PermissionCodes.STUDENTS_READ);

	const studentsQuery = useStudentsQuery(tenantId, campusId, canRead);
	const yearsQuery = useAcademicYearsQuery(tenantId, canRead);
	const sectionsQuery = useSectionsQuery(tenantId, campusId, canRead);
	const createStudent = useCreateStudentMutation(tenantId ?? "", campusId);
	const createEnrollment = useCreateEnrollmentMutation(tenantId ?? "");

	const [studentCode, setStudentCode] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [selectedStudentId, setSelectedStudentId] = useState("");
	const [selectedSectionId, setSelectedSectionId] = useState("");
	const [selectedYearId, setSelectedYearId] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const enrollmentsQuery = useStudentEnrollmentsQuery(
		tenantId,
		selectedStudentId || null,
		Boolean(selectedStudentId),
	);

	const activeYearId = useMemo(() => {
		const activeYear = yearsQuery.data?.find((year) => year.status === "active");
		return activeYear?.id ?? yearsQuery.data?.[0]?.id ?? "";
	}, [yearsQuery.data]);

	const sectionOptions = useMemo(() => {
		const yearId = selectedYearId || activeYearId;
		return (sectionsQuery.data ?? []).filter((section) => section.academicYearId === yearId);
	}, [sectionsQuery.data, selectedYearId, activeYearId]);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage students.</AlertDescription>
			</Alert>
		);
	}

	if (!canRead) {
		return (
			<Alert>
				<AlertDescription>You do not have permission to view student records.</AlertDescription>
			</Alert>
		);
	}

	async function handleCreateStudent(event: React.FormEvent) {
		event.preventDefault();
		if (!campusId) return;
		setError(null);
		setMessage(null);
		try {
			const result = await createStudent.mutateAsync({
				campusId,
				studentCode,
				firstName,
				lastName,
			});
			setStudentCode("");
			setFirstName("");
			setLastName("");
			setSelectedStudentId(result.student.id);
			setMessage(`Student ${result.student.fullName} created`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create student");
		}
	}

	async function handleCreateEnrollment(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		setMessage(null);
		const academicYearId = selectedYearId || activeYearId;
		if (!selectedStudentId || !selectedSectionId || !academicYearId) {
			setError("Select a student, academic year, and section");
			return;
		}
		try {
			await createEnrollment.mutateAsync({
				studentId: selectedStudentId,
				input: {
					sectionId: selectedSectionId,
					academicYearId,
				},
			});
			setMessage("Student enrolled successfully");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not enroll student");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-dashboard-accent-soft text-dashboard-accent">
					<HugeiconsIcon icon={StudentIcon} className="size-5" strokeWidth={2} />
				</div>
				<div>
					<h1 className="font-semibold text-[24px] text-dashboard-text-primary">Students</h1>
					<p className="text-dashboard-text-secondary text-sm">
						Create student records and enroll them into sections for the active academic year.
					</p>
				</div>
			</div>

			{message ? (
				<Alert>
					<AlertDescription>{message}</AlertDescription>
				</Alert>
			) : null}
			{error ? (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}

			<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
				<Card className="border-dashboard-border bg-dashboard-surface">
					<CardHeader>
						<CardTitle>Student roster</CardTitle>
						<CardDescription>
							{campusId
								? "Students registered for the selected campus."
								: "Select a campus to filter the roster."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{studentsQuery.isLoading ? (
							<div className="flex justify-center py-8">
								<Spinner />
							</div>
						) : studentsQuery.data?.length ? (
							<ul className="divide-y divide-border">
								{studentsQuery.data.map((student) => (
									<li key={student.id} className="flex items-center justify-between py-3">
										<div>
											<p className="font-medium text-dashboard-text-primary">{student.fullName}</p>
											<p className="text-dashboard-text-secondary text-sm">
												{student.studentCode} · {student.status}
											</p>
										</div>
										<Button
											type="button"
											variant={selectedStudentId === student.id ? "default" : "outline"}
											size="sm"
											onClick={() => setSelectedStudentId(student.id)}
										>
											Select
										</Button>
									</li>
								))}
							</ul>
						) : (
							<p className="text-dashboard-text-secondary text-sm">No students yet.</p>
						)}
					</CardContent>
				</Card>

				<div className="space-y-6">
					{canWrite ? (
						<Card className="border-dashboard-border bg-dashboard-surface">
							<CardHeader>
								<CardTitle>Add student</CardTitle>
								<CardDescription>
									Admission numbers must be unique across the organization.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleCreateStudent}>
									<FieldGroup>
										<Field>
											<FieldLabel htmlFor="student-code">Admission number</FieldLabel>
											<Input
												id="student-code"
												value={studentCode}
												onChange={(event) => setStudentCode(event.target.value)}
												placeholder="AKES-2026-001"
												required
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="first-name">First name</FieldLabel>
											<Input
												id="first-name"
												value={firstName}
												onChange={(event) => setFirstName(event.target.value)}
												required
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="last-name">Last name</FieldLabel>
											<Input
												id="last-name"
												value={lastName}
												onChange={(event) => setLastName(event.target.value)}
												required
											/>
										</Field>
										<Button type="submit" disabled={createStudent.isPending || !campusId}>
											{createStudent.isPending ? "Creating..." : "Create student"}
										</Button>
									</FieldGroup>
								</form>
							</CardContent>
						</Card>
					) : null}

					{canWrite ? (
						<Card className="border-dashboard-border bg-dashboard-surface">
							<CardHeader>
								<CardTitle>Enroll student</CardTitle>
								<CardDescription>
									Assign the selected student to a section for one academic year.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleCreateEnrollment}>
									<FieldGroup>
										<Field>
											<FieldLabel htmlFor="enroll-year">Academic year</FieldLabel>
											<SelectField
												id="enroll-year"
												value={selectedYearId || activeYearId}
												onValueChange={setSelectedYearId}
												items={(yearsQuery.data ?? []).map((year) => ({
													label: year.name,
													value: year.id,
												}))}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="enroll-section">Section</FieldLabel>
											<SelectField
												id="enroll-section"
												value={selectedSectionId}
												onValueChange={setSelectedSectionId}
												nullable
												placeholder="Select section"
												items={sectionOptions.map((section) => ({
													label: section.name,
													value: section.id,
												}))}
											/>
										</Field>
										<Button
											type="submit"
											disabled={createEnrollment.isPending || !selectedStudentId}
										>
											{createEnrollment.isPending ? "Enrolling..." : "Enroll student"}
										</Button>
									</FieldGroup>
								</form>
								{selectedStudentId && enrollmentsQuery.data?.length ? (
									<div className="mt-4 space-y-2">
										<p className="font-medium text-sm">Current enrollments</p>
										<ul className="space-y-1 text-dashboard-text-secondary text-sm">
											{enrollmentsQuery.data.map((enrollment) => (
												<li key={enrollment.id}>
													Section {enrollment.sectionId.slice(0, 8)} · {enrollment.status}
												</li>
											))}
										</ul>
									</div>
								) : null}
							</CardContent>
						</Card>
					) : null}
				</div>
			</div>
		</div>
	);
}
