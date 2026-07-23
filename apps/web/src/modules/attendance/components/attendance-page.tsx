"use client";

import { ClipboardIcon } from "@hugeicons/core-free-icons";
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
import { useMemo, useState } from "react";
import { useSectionsQuery } from "@/modules/academic";
import {
	useGetOrCreateSessionMutation,
	useMarkAttendanceMutation,
} from "@/modules/attendance/hooks/use-attendance-queries";
import type { AttendanceMarkStatus } from "@/modules/attendance/types/attendance.types";
import { useSectionEnrollmentsQuery, useStudentsQuery } from "@/modules/students";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";

const statusOptions: AttendanceMarkStatus[] = [
	"present",
	"absent",
	"late",
	"excused",
	"left_early",
	"unknown",
];

export function AttendancePage() {
	const { activeTenant, activeCampus, campuses } = useTenantContext();
	const { can } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const campusId = activeCampus?.id ?? campuses[0]?.id ?? null;
	const canRead = can(PermissionCodes.ATTENDANCE_READ);
	const canMark = can(PermissionCodes.ATTENDANCE_MARK);

	const sectionsQuery = useSectionsQuery(tenantId, campusId, canRead);
	const studentsQuery = useStudentsQuery(tenantId, campusId, canRead);

	const [sectionId, setSectionId] = useState("");
	const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [markDraft, setMarkDraft] = useState<Record<string, AttendanceMarkStatus>>({});
	const [summary, setSummary] = useState<Record<string, number> | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const enrollmentsQuery = useSectionEnrollmentsQuery(
		tenantId,
		sectionId || null,
		Boolean(sectionId),
	);
	const loadSession = useGetOrCreateSessionMutation(tenantId ?? "");
	const markAttendance = useMarkAttendanceMutation(tenantId ?? "", sessionId ?? "");

	const roster = useMemo(() => {
		const students = studentsQuery.data ?? [];
		const studentMap = new Map(students.map((student) => [student.id, student]));
		return (enrollmentsQuery.data ?? [])
			.filter((enrollment) => enrollment.status === "active")
			.map((enrollment) => ({
				enrollment,
				student: studentMap.get(enrollment.studentId),
			}))
			.filter((row) => row.student);
	}, [enrollmentsQuery.data, studentsQuery.data]);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to mark attendance.</AlertDescription>
			</Alert>
		);
	}

	if (!canRead) {
		return (
			<Alert>
				<AlertDescription>You do not have permission to view attendance.</AlertDescription>
			</Alert>
		);
	}

	async function handleLoadSession(event: React.FormEvent) {
		event.preventDefault();
		if (!sectionId) {
			setError("Select a section");
			return;
		}
		setError(null);
		setMessage(null);
		try {
			const result = await loadSession.mutateAsync({ sectionId, sessionDate });
			setSessionId(result.session.id);
			const nextDraft: Record<string, AttendanceMarkStatus> = {};
			for (const mark of result.marks) {
				nextDraft[mark.studentId] = mark.status;
			}
			setMarkDraft(nextDraft);
			setSummary(result.summary);
			setMessage(`Loaded session for ${result.session.sessionDate}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not load attendance session");
		}
	}

	async function handleSaveMarks(event: React.FormEvent) {
		event.preventDefault();
		if (!sessionId) {
			setError("Load a session first");
			return;
		}
		if (!canMark) {
			setError("You do not have permission to mark attendance");
			return;
		}
		const marks = roster
			.map((row) => row.student?.id)
			.filter(Boolean)
			.map((studentId) => ({
				studentId: studentId as string,
				status: markDraft[studentId as string] ?? "unknown",
			}));
		if (marks.length === 0) {
			setError("No enrolled students found for this section");
			return;
		}
		setError(null);
		setMessage(null);
		try {
			const result = await markAttendance.mutateAsync({ marks });
			setSummary(result.summary);
			setMessage("Attendance saved");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save attendance");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
					<HugeiconsIcon icon={ClipboardIcon} className="size-5" />
				</div>
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
					<p className="text-sm text-muted-foreground">
						Mark daily class attendance for enrolled students.
					</p>
				</div>
			</div>

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

			<Card>
				<CardHeader>
					<CardTitle>Session</CardTitle>
					<CardDescription>
						Select a section and date, then load or create the session.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLoadSession} className="space-y-4">
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="attendance-section">Section</FieldLabel>
								<select
									id="attendance-section"
									className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
									value={sectionId}
									onChange={(event) => setSectionId(event.target.value)}
								>
									<option value="">Select section</option>
									{(sectionsQuery.data ?? []).map((section) => (
										<option key={section.id} value={section.id}>
											{section.name}
										</option>
									))}
								</select>
							</Field>
							<Field>
								<FieldLabel htmlFor="attendance-date">Date</FieldLabel>
								<Input
									id="attendance-date"
									type="date"
									value={sessionDate}
									onChange={(event) => setSessionDate(event.target.value)}
								/>
							</Field>
						</FieldGroup>
						<Button type="submit" disabled={loadSession.isPending}>
							{loadSession.isPending ? <Spinner className="size-4" /> : "Load session"}
						</Button>
					</form>
				</CardContent>
			</Card>

			{sessionId ? (
				<Card>
					<CardHeader>
						<CardTitle>Roster</CardTitle>
						<CardDescription>
							{summary
								? `${summary.present ?? 0} present · ${summary.absent ?? 0} absent · ${summary.late ?? 0} late`
								: "Mark each student, then save."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{enrollmentsQuery.isLoading || studentsQuery.isLoading ? (
							<div className="flex justify-center py-8">
								<Spinner className="size-6" />
							</div>
						) : roster.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No active enrollments in this section.
							</p>
						) : (
							<form onSubmit={handleSaveMarks} className="space-y-4">
								<ul className="divide-y rounded-md border">
									{roster.map(({ student }) =>
										student ? (
											<li
												key={student.id}
												className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
											>
												<div>
													<p className="font-medium">{student.fullName}</p>
													<p className="text-xs text-muted-foreground">{student.studentCode}</p>
												</div>
												<select
													className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
													value={markDraft[student.id] ?? "unknown"}
													onChange={(event) =>
														setMarkDraft((current) => ({
															...current,
															[student.id]: event.target.value as AttendanceMarkStatus,
														}))
													}
													disabled={!canMark}
												>
													{statusOptions.map((status) => (
														<option key={status} value={status}>
															{status.replaceAll("_", " ")}
														</option>
													))}
												</select>
											</li>
										) : null,
									)}
								</ul>
								{canMark ? (
									<Button type="submit" disabled={markAttendance.isPending}>
										{markAttendance.isPending ? <Spinner className="size-4" /> : "Save attendance"}
									</Button>
								) : null}
							</form>
						)}
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}
