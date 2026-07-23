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
import { useAcademicYearsQuery, useClassesQuery, useSectionsQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import { useGuardiansQuery, useLinkStudentGuardianMutation } from "@/modules/guardians";
import {
	useCreateEnrollmentMutation,
	useCreateStudentMutation,
	useStudentEnrollmentsQuery,
	useStudentQuery,
	useStudentsQuery,
} from "@/modules/students";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";

export function StudentsPage() {
	const { activeTenant, activeCampus, campuses } = useTenantContext();
	const { can, isLoading: permissionsLoading } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const campusId = activeCampus?.id ?? campuses[0]?.id ?? null;
	const canWrite = can(PermissionCodes.STUDENTS_WRITE);
	const canWriteGuardians = can(PermissionCodes.GUARDIANS_WRITE);
	const canRead = can(PermissionCodes.STUDENTS_READ);
	const canReadGuardians = can(PermissionCodes.GUARDIANS_READ);
	const canReadAcademic = can(PermissionCodes.ACADEMIC_READ);

	const studentsQuery = useStudentsQuery(tenantId, campusId, canRead);
	const guardiansQuery = useGuardiansQuery(tenantId, canReadGuardians);
	const yearsQuery = useAcademicYearsQuery(tenantId, canReadAcademic);
	const sectionsQuery = useSectionsQuery(tenantId, campusId, canReadAcademic);
	const classesQuery = useClassesQuery(tenantId, canReadAcademic);
	const createStudent = useCreateStudentMutation(tenantId ?? "", campusId);
	const createEnrollment = useCreateEnrollmentMutation(tenantId ?? "");

	const [studentCode, setStudentCode] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [dateOfBirth, setDateOfBirth] = useState("");
	const [gender, setGender] = useState("");
	const [studentEmail, setStudentEmail] = useState("");
	const [studentPhone, setStudentPhone] = useState("");
	const [addressLine1, setAddressLine1] = useState("");
	const [city, setCity] = useState("");
	const [emergencyContactName, setEmergencyContactName] = useState("");
	const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
	const [previousSchool, setPreviousSchool] = useState("");
	const [guardianFirstName, setGuardianFirstName] = useState("");
	const [guardianLastName, setGuardianLastName] = useState("");
	const [guardianPhone, setGuardianPhone] = useState("");
	const [guardianRelationship, setGuardianRelationship] = useState("father");
	const [selectedStudentId, setSelectedStudentId] = useState("");
	const [selectedSectionId, setSelectedSectionId] = useState("");
	const [selectedYearId, setSelectedYearId] = useState("");
	const [linkGuardianId, setLinkGuardianId] = useState("");
	const [linkRelationship, setLinkRelationship] = useState("mother");
	const [linkNewFirstName, setLinkNewFirstName] = useState("");
	const [linkNewLastName, setLinkNewLastName] = useState("");
	const [linkNewPhone, setLinkNewPhone] = useState("");
	const [useNewGuardian, setUseNewGuardian] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const enrollmentsQuery = useStudentEnrollmentsQuery(
		tenantId,
		selectedStudentId || null,
		Boolean(selectedStudentId),
	);
	const studentDetailQuery = useStudentQuery(
		tenantId,
		selectedStudentId || null,
		Boolean(selectedStudentId),
	);
	const linkGuardian = useLinkStudentGuardianMutation(tenantId ?? "", selectedStudentId);

	const guardianItems = useMemo(
		() =>
			(guardiansQuery.data ?? []).map((guardian) => ({
				label: guardian.fullName,
				value: guardian.id,
			})),
		[guardiansQuery.data],
	);

	const activeYearId = useMemo(() => {
		const activeYear = yearsQuery.data?.find((year) => year.status === "active");
		return activeYear?.id ?? yearsQuery.data?.[0]?.id ?? "";
	}, [yearsQuery.data]);

	const sectionOptions = useMemo(() => {
		const yearId = selectedYearId || activeYearId;
		return (sectionsQuery.data ?? []).filter((section) => section.academicYearId === yearId);
	}, [sectionsQuery.data, selectedYearId, activeYearId]);

	const classNameById = useMemo(
		() => new Map((classesQuery.data ?? []).map((item) => [item.id, item.name])),
		[classesQuery.data],
	);
	const campusNameById = useMemo(
		() => new Map(campuses.map((campus) => [campus.id, campus.name])),
		[campuses],
	);
	const sectionLabelById = useMemo(
		() =>
			new Map(
				(sectionsQuery.data ?? []).map((section) => [
					section.id,
					formatSectionLabel(
						section,
						classNameById.get(section.classId),
						campusNameById.get(section.campusId),
					),
				]),
			),
		[campusNameById, classNameById, sectionsQuery.data],
	);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage students.</AlertDescription>
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
				dateOfBirth: dateOfBirth || undefined,
				gender: gender ? (gender as "male" | "female" | "other" | "prefer_not_to_say") : undefined,
				email: studentEmail || undefined,
				phone: studentPhone || undefined,
				addressLine1: addressLine1 || undefined,
				city: city || undefined,
				emergencyContactName: emergencyContactName || undefined,
				emergencyContactPhone: emergencyContactPhone || undefined,
				previousSchool: previousSchool || undefined,
				admittedOn: new Date().toISOString().slice(0, 10),
				guardians:
					guardianFirstName && guardianLastName
						? [
								{
									firstName: guardianFirstName,
									lastName: guardianLastName,
									phone: guardianPhone || undefined,
									relationship: guardianRelationship as
										| "father"
										| "mother"
										| "guardian"
										| "step_parent"
										| "grandparent"
										| "sibling"
										| "other",
									isPrimary: true,
								},
							]
						: undefined,
			});
			setStudentCode("");
			setFirstName("");
			setLastName("");
			setDateOfBirth("");
			setGender("");
			setStudentEmail("");
			setStudentPhone("");
			setAddressLine1("");
			setCity("");
			setEmergencyContactName("");
			setEmergencyContactPhone("");
			setPreviousSchool("");
			setGuardianFirstName("");
			setGuardianLastName("");
			setGuardianPhone("");
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

	async function handleLinkGuardian(event: React.FormEvent) {
		event.preventDefault();
		if (!selectedStudentId || !canWriteGuardians) return;
		setError(null);
		setMessage(null);
		try {
			if (useNewGuardian) {
				await linkGuardian.mutateAsync({
					guardian: {
						firstName: linkNewFirstName,
						lastName: linkNewLastName,
						phone: linkNewPhone || undefined,
					},
					relationship: linkRelationship as
						| "father"
						| "mother"
						| "guardian"
						| "step_parent"
						| "grandparent"
						| "sibling"
						| "other",
				});
			} else {
				if (!linkGuardianId) {
					setError("Select a guardian or add a new one");
					return;
				}
				await linkGuardian.mutateAsync({
					guardianId: linkGuardianId,
					relationship: linkRelationship as
						| "father"
						| "mother"
						| "guardian"
						| "step_parent"
						| "grandparent"
						| "sibling"
						| "other",
				});
			}
			setLinkGuardianId("");
			setLinkNewFirstName("");
			setLinkNewLastName("");
			setLinkNewPhone("");
			setMessage("Guardian linked to student");
			await studentDetailQuery.refetch();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not link guardian");
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

				{selectedStudentId && studentDetailQuery.data ? (
					<Card className="border-dashboard-border bg-dashboard-surface">
						<CardHeader>
							<CardTitle>Student profile</CardTitle>
							<CardDescription>
								Admission details and linked guardians for the selected student.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 text-sm">
							{studentDetailQuery.isLoading ? (
								<div className="flex justify-center py-4">
									<Spinner />
								</div>
							) : (
								<>
									<dl className="grid gap-3 sm:grid-cols-2">
										<div>
											<dt className="text-dashboard-text-muted text-xs uppercase">Full name</dt>
											<dd className="font-medium">{studentDetailQuery.data.student.fullName}</dd>
										</div>
										<div>
											<dt className="text-dashboard-text-muted text-xs uppercase">Admission no.</dt>
											<dd>{studentDetailQuery.data.student.studentCode}</dd>
										</div>
										<div>
											<dt className="text-dashboard-text-muted text-xs uppercase">Date of birth</dt>
											<dd>{studentDetailQuery.data.student.dateOfBirth ?? "—"}</dd>
										</div>
										<div>
											<dt className="text-dashboard-text-muted text-xs uppercase">Admitted on</dt>
											<dd>{studentDetailQuery.data.student.admittedOn ?? "—"}</dd>
										</div>
										<div>
											<dt className="text-dashboard-text-muted text-xs uppercase">
												Previous school
											</dt>
											<dd>{studentDetailQuery.data.student.previousSchool ?? "—"}</dd>
										</div>
										<div>
											<dt className="text-dashboard-text-muted text-xs uppercase">
												Emergency contact
											</dt>
											<dd>
												{studentDetailQuery.data.student.emergencyContactName ?? "—"}
												{studentDetailQuery.data.student.emergencyContactPhone
													? ` · ${studentDetailQuery.data.student.emergencyContactPhone}`
													: ""}
											</dd>
										</div>
									</dl>
									<div>
										<p className="mb-2 font-medium">Guardians</p>
										{studentDetailQuery.data.guardians.length === 0 ? (
											<p className="text-dashboard-text-secondary">No guardians linked yet.</p>
										) : (
											<ul className="space-y-2">
												{studentDetailQuery.data.guardians.map((link) => (
													<li
														key={link.id}
														className="rounded-lg border border-dashboard-border-subtle px-3 py-2"
													>
														<p className="font-medium">{link.guardian.fullName}</p>
														<p className="text-dashboard-text-secondary text-xs">
															{link.relationship}
															{link.isPrimary ? " · Primary" : ""}
															{link.guardian.phone ? ` · ${link.guardian.phone}` : ""}
															{link.guardian.email ? ` · ${link.guardian.email}` : ""}
														</p>
													</li>
												))}
											</ul>
										)}
									</div>
									{canWriteGuardians ? (
										<form
											onSubmit={handleLinkGuardian}
											className="rounded-lg border border-dashboard-border-subtle p-3"
										>
											<p className="mb-3 font-medium text-[13px]">Link another guardian</p>
											<FieldGroup className="gap-3">
												<Field>
													<FieldLabel htmlFor="link-mode">Source</FieldLabel>
													<SelectField
														id="link-mode"
														value={useNewGuardian ? "new" : "existing"}
														onValueChange={(value) => setUseNewGuardian(value === "new")}
														items={[
															{ label: "Existing guardian", value: "existing" },
															{ label: "New guardian", value: "new" },
														]}
													/>
												</Field>
												{useNewGuardian ? (
													<>
														<Field>
															<FieldLabel htmlFor="link-first">First name</FieldLabel>
															<Input
																id="link-first"
																value={linkNewFirstName}
																onChange={(e) => setLinkNewFirstName(e.target.value)}
																required
															/>
														</Field>
														<Field>
															<FieldLabel htmlFor="link-last">Last name</FieldLabel>
															<Input
																id="link-last"
																value={linkNewLastName}
																onChange={(e) => setLinkNewLastName(e.target.value)}
																required
															/>
														</Field>
														<Field>
															<FieldLabel htmlFor="link-phone">Phone</FieldLabel>
															<Input
																id="link-phone"
																value={linkNewPhone}
																onChange={(e) => setLinkNewPhone(e.target.value)}
															/>
														</Field>
													</>
												) : (
													<Field>
														<FieldLabel htmlFor="link-guardian">Guardian</FieldLabel>
														<SelectField
															id="link-guardian"
															value={linkGuardianId}
															onValueChange={setLinkGuardianId}
															placeholder="Select guardian"
															items={guardianItems}
														/>
													</Field>
												)}
												<Field>
													<FieldLabel htmlFor="link-relationship">Relationship</FieldLabel>
													<SelectField
														id="link-relationship"
														value={linkRelationship}
														onValueChange={setLinkRelationship}
														items={[
															{ label: "Father", value: "father" },
															{ label: "Mother", value: "mother" },
															{ label: "Guardian", value: "guardian" },
															{ label: "Step parent", value: "step_parent" },
															{ label: "Grandparent", value: "grandparent" },
															{ label: "Other", value: "other" },
														]}
													/>
												</Field>
												<Button type="submit" size="sm" disabled={linkGuardian.isPending}>
													{linkGuardian.isPending ? "Linking..." : "Link guardian"}
												</Button>
											</FieldGroup>
										</form>
									) : null}
								</>
							)}
						</CardContent>
					</Card>
				) : null}

				<div className="space-y-6">
					{canWrite ? (
						<Card className="border-dashboard-border bg-dashboard-surface">
							<CardHeader>
								<CardTitle>Admit student</CardTitle>
								<CardDescription>
									Capture student details and a primary guardian at admission time.
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
										<Field>
											<FieldLabel htmlFor="date-of-birth">Date of birth</FieldLabel>
											<Input
												id="date-of-birth"
												type="date"
												value={dateOfBirth}
												onChange={(event) => setDateOfBirth(event.target.value)}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="gender">Gender</FieldLabel>
											<SelectField
												id="gender"
												value={gender}
												onValueChange={setGender}
												nullable
												placeholder="Select gender"
												items={[
													{ label: "Male", value: "male" },
													{ label: "Female", value: "female" },
													{ label: "Other", value: "other" },
													{ label: "Prefer not to say", value: "prefer_not_to_say" },
												]}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="student-email">Student email</FieldLabel>
											<Input
												id="student-email"
												type="email"
												value={studentEmail}
												onChange={(event) => setStudentEmail(event.target.value)}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="student-phone">Student phone</FieldLabel>
											<Input
												id="student-phone"
												value={studentPhone}
												onChange={(event) => setStudentPhone(event.target.value)}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="address">Address</FieldLabel>
											<Input
												id="address"
												value={addressLine1}
												onChange={(event) => setAddressLine1(event.target.value)}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="city">City</FieldLabel>
											<Input
												id="city"
												value={city}
												onChange={(event) => setCity(event.target.value)}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="emergency-name">Emergency contact name</FieldLabel>
											<Input
												id="emergency-name"
												value={emergencyContactName}
												onChange={(event) => setEmergencyContactName(event.target.value)}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="emergency-phone">Emergency contact phone</FieldLabel>
											<Input
												id="emergency-phone"
												value={emergencyContactPhone}
												onChange={(event) => setEmergencyContactPhone(event.target.value)}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="previous-school">Previous school</FieldLabel>
											<Input
												id="previous-school"
												value={previousSchool}
												onChange={(event) => setPreviousSchool(event.target.value)}
											/>
										</Field>
										<div className="rounded-lg border border-dashboard-border-subtle p-3">
											<p className="mb-3 font-medium text-[13px] text-dashboard-text-primary">
												Primary guardian
											</p>
											<FieldGroup>
												<Field>
													<FieldLabel htmlFor="guardian-first-name">First name</FieldLabel>
													<Input
														id="guardian-first-name"
														value={guardianFirstName}
														onChange={(event) => setGuardianFirstName(event.target.value)}
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="guardian-last-name">Last name</FieldLabel>
													<Input
														id="guardian-last-name"
														value={guardianLastName}
														onChange={(event) => setGuardianLastName(event.target.value)}
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="guardian-phone">Phone</FieldLabel>
													<Input
														id="guardian-phone"
														value={guardianPhone}
														onChange={(event) => setGuardianPhone(event.target.value)}
													/>
												</Field>
												<Field>
													<FieldLabel htmlFor="guardian-relationship">Relationship</FieldLabel>
													<SelectField
														id="guardian-relationship"
														value={guardianRelationship}
														onValueChange={setGuardianRelationship}
														items={[
															{ label: "Father", value: "father" },
															{ label: "Mother", value: "mother" },
															{ label: "Guardian", value: "guardian" },
															{ label: "Step parent", value: "step_parent" },
															{ label: "Grandparent", value: "grandparent" },
															{ label: "Other", value: "other" },
														]}
													/>
												</Field>
											</FieldGroup>
										</div>
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
													label:
														sectionLabelById.get(section.id) ??
														formatSectionLabel(
															section,
															classNameById.get(section.classId),
															campusNameById.get(section.campusId),
														),
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
													{sectionLabelById.get(enrollment.sectionId) ??
														`Section ${enrollment.sectionId.slice(0, 8)}`}{" "}
													· {enrollment.status}
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
