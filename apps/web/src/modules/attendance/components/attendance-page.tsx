"use client";

import { Calendar03Icon, ClipboardIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { DatePicker } from "@school-os/ui/components/date-picker";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { SelectField } from "@school-os/ui/components/select-field";
import { Spinner } from "@school-os/ui/components/spinner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClassesQuery, useSectionsQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import {
	useGetOrCreateSessionMutation,
	useMarkAttendanceMutation,
} from "@/modules/attendance/hooks/use-attendance-queries";
import type { AttendanceMarkStatus } from "@/modules/attendance/types/attendance.types";
import { useMyTeacherProfileQuery } from "@/modules/staff/hooks/use-staff-queries";
import { useSectionEnrollmentsQuery, useStudentsQuery } from "@/modules/students";
import {
	PermissionCodes,
	useOrganizationConfigQuery,
	usePermissions,
	useTenantContext,
} from "@/modules/tenants";
import {
	type AttendanceStatusFilter,
	buildSmartDefaultDraft,
	computeDraftSummary,
	filterRosterByStatus,
} from "../utils/attendance-ui.utils";
import { AttendanceRosterGrid } from "./attendance-roster-grid";
import { AttendanceSmartToolbar } from "./attendance-smart-toolbar";
import { AttendanceSummaryStrip } from "./attendance-summary-strip";

export function AttendancePage() {
	const { activeTenant, activeCampus, campuses } = useTenantContext();
	const { can, role, isLoading: permissionsLoading } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const campusId = activeCampus?.id ?? campuses[0]?.id ?? null;
	const canRead = can(PermissionCodes.ATTENDANCE_READ);
	const canMark = can(PermissionCodes.ATTENDANCE_MARK);
	const canReadAcademic = can(PermissionCodes.ACADEMIC_READ);
	const isTeacherScoped = role === "teacher" && !can(PermissionCodes.TENANT_MEMBERSHIP_READ);

	const sectionsQuery = useSectionsQuery(tenantId, campusId, canRead && !isTeacherScoped);
	const classesQuery = useClassesQuery(tenantId, canReadAcademic);
	const myProfileQuery = useMyTeacherProfileQuery(tenantId, canRead && isTeacherScoped);
	const studentsQuery = useStudentsQuery(tenantId, campusId, canRead);
	const orgConfigQuery = useOrganizationConfigQuery(tenantId, canRead);

	const classNameById = useMemo(
		() => new Map((classesQuery.data ?? []).map((item) => [item.id, item.name])),
		[classesQuery.data],
	);
	const campusNameById = useMemo(
		() => new Map(campuses.map((campus) => [campus.id, campus.name])),
		[campuses],
	);

	const selectableSections = useMemo(() => {
		if (isTeacherScoped) {
			return myProfileQuery.data?.homeroomSections ?? [];
		}
		return (sectionsQuery.data ?? []).filter(
			(section) => !campusId || section.campusId === campusId,
		);
	}, [campusId, isTeacherScoped, myProfileQuery.data?.homeroomSections, sectionsQuery.data]);

	const sectionSelectItems = useMemo(
		() =>
			selectableSections.map((section) => ({
				label: formatSectionLabel(
					section,
					classNameById.get(section.classId),
					campusNameById.get(section.campusId),
				),
				value: section.id,
			})),
		[campusNameById, classNameById, selectableSections],
	);

	const [sectionId, setSectionId] = useState("");
	const [sessionDate, setSessionDate] = useState(() => new Date().toISOString().slice(0, 10));
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [savedMarks, setSavedMarks] = useState<Record<string, AttendanceMarkStatus>>({});
	const [markDraft, setMarkDraft] = useState<Record<string, AttendanceMarkStatus>>({});
	const [statusFilter, setStatusFilter] = useState<AttendanceStatusFilter>("all");
	const [search, setSearch] = useState("");
	const [scanMode, setScanMode] = useState(false);
	const [scanValue, setScanValue] = useState("");
	const [lastScanMessage, setLastScanMessage] = useState<string | null>(null);
	const [highlightStudentId, setHighlightStudentId] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const autoLoadedKey = useRef<string | null>(null);

	const enrollmentsQuery = useSectionEnrollmentsQuery(
		tenantId,
		sectionId || null,
		Boolean(sectionId),
	);
	const loadSession = useGetOrCreateSessionMutation(tenantId ?? "");
	const markAttendance = useMarkAttendanceMutation(tenantId ?? "", sessionId ?? "");

	const graceMinutes = orgConfigQuery.data?.settings.attendanceGraceMinutes ?? 15;
	const selectedSection = selectableSections.find((section) => section.id === sectionId);

	useEffect(() => {
		if (sectionId || sectionSelectItems.length !== 1) return;
		setSectionId(sectionSelectItems[0]?.value ?? "");
	}, [sectionId, sectionSelectItems]);

	const rosterStudents = useMemo(() => {
		const students = studentsQuery.data ?? [];
		const studentMap = new Map(students.map((student) => [student.id, student]));
		return (enrollmentsQuery.data ?? [])
			.filter((enrollment) => enrollment.status === "active")
			.map((enrollment) => studentMap.get(enrollment.studentId))
			.filter((student): student is NonNullable<typeof student> => Boolean(student))
			.sort((a, b) => a.fullName.localeCompare(b.fullName));
	}, [enrollmentsQuery.data, studentsQuery.data]);

	const rosterIds = useMemo(() => rosterStudents.map((student) => student.id), [rosterStudents]);

	const liveSummary = useMemo(
		() => computeDraftSummary(rosterIds, markDraft),
		[rosterIds, markDraft],
	);

	const filteredRoster = useMemo(() => {
		const query = search.trim().toLowerCase();
		let ids = filterRosterByStatus(rosterIds, markDraft, statusFilter);
		if (query) {
			ids = ids.filter((id) => {
				const student = rosterStudents.find((row) => row.id === id);
				if (!student) return false;
				return (
					student.fullName.toLowerCase().includes(query) ||
					student.studentCode.toLowerCase().includes(query)
				);
			});
		}
		return rosterStudents.filter((student) => ids.includes(student.id));
	}, [rosterIds, markDraft, statusFilter, search, rosterStudents]);

	const unsavedCount = useMemo(() => {
		return rosterIds.filter((id) => {
			const draft = markDraft[id] ?? "unknown";
			const baseline = savedMarks[id] ?? "present";
			return draft !== baseline;
		}).length;
	}, [rosterIds, markDraft, savedMarks]);

	const loadSessionForSelection = useCallback(async () => {
		if (!sectionId) {
			setError("Select a section");
			return;
		}
		setError(null);
		setMessage(null);
		try {
			const result = await loadSession.mutateAsync({ sectionId, sessionDate });
			setSessionId(result.session.id);
			const existing: Record<string, AttendanceMarkStatus> = {};
			for (const mark of result.marks) {
				existing[mark.studentId] = mark.status;
			}
			setSavedMarks(existing);
			setStatusFilter("all");
			setMessage(`Session ready · ${result.session.sessionDate}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not load attendance session");
		}
	}, [loadSession, sectionId, sessionDate]);

	useEffect(() => {
		if (!sectionId || !sessionDate || !tenantId) return;
		const key = `${sectionId}:${sessionDate}`;
		if (autoLoadedKey.current === key) return;
		autoLoadedKey.current = key;
		setSessionId(null);
		setSavedMarks({});
		setMarkDraft({});
		void loadSessionForSelection();
	}, [sectionId, sessionDate, tenantId, loadSessionForSelection]);

	useEffect(() => {
		if (!sessionId || rosterIds.length === 0) return;
		setMarkDraft(buildSmartDefaultDraft(rosterIds, savedMarks));
	}, [sessionId, rosterIds, savedMarks]);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to mark attendance.</AlertDescription>
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
				<AlertDescription>You do not have permission to view attendance.</AlertDescription>
			</Alert>
		);
	}

	if (isTeacherScoped && myProfileQuery.isLoading) {
		return (
			<div className="flex min-h-[240px] items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	if (isTeacherScoped && selectableSections.length === 0) {
		return (
			<Alert>
				<AlertDescription>
					No homeroom sections are assigned to you. Ask an administrator to set you as homeroom
					teacher before marking attendance.
				</AlertDescription>
			</Alert>
		);
	}

	function handleMarkAllPresent() {
		setMarkDraft((current) => {
			const next = { ...current };
			for (const id of rosterIds) next[id] = "present";
			return next;
		});
		setMessage("Marked entire roster as present");
	}

	function handleMarkUnmarkedAbsent() {
		setMarkDraft((current) => {
			const next = { ...current };
			for (const id of rosterIds) {
				if ((next[id] ?? "unknown") === "unknown") next[id] = "absent";
			}
			return next;
		});
		setMessage("Unmarked students flagged absent for follow-up");
	}

	function handleScanSubmit() {
		const code = scanValue.trim().toLowerCase();
		if (!code) return;
		const student = rosterStudents.find(
			(row) => row.studentCode.toLowerCase() === code || row.id === code,
		);
		if (!student) {
			setLastScanMessage(`No match for "${scanValue.trim()}" in this section`);
			return;
		}
		setMarkDraft((current) => ({ ...current, [student.id]: "present" }));
		setHighlightStudentId(student.id);
		setLastScanMessage(`Marked ${student.fullName} present`);
		setScanValue("");
		window.setTimeout(() => setHighlightStudentId(null), 1200);
	}

	async function handleSaveMarks() {
		if (!sessionId) {
			setError("Load a session first");
			return;
		}
		if (!canMark) {
			setError("You do not have permission to mark attendance");
			return;
		}
		const marks = rosterIds.map((studentId) => ({
			studentId,
			status: markDraft[studentId] ?? "unknown",
		}));
		if (marks.length === 0) {
			setError("No enrolled students found for this section");
			return;
		}
		setError(null);
		setMessage(null);
		try {
			await markAttendance.mutateAsync({ marks });
			setSavedMarks(Object.fromEntries(rosterIds.map((id) => [id, markDraft[id] ?? "present"])));
			setMessage("Attendance saved · parent alerts will queue when enabled");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save attendance");
		}
	}

	return (
		<div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
			<header className="border-dashboard-border border-b pb-5">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex size-11 items-center justify-center rounded-xl bg-dashboard-accent-soft text-dashboard-accent">
							<HugeiconsIcon icon={ClipboardIcon} className="size-5" strokeWidth={2} />
						</div>
						<div>
							<h1 className="font-semibold text-[24px] text-dashboard-text-primary tracking-tight">
								Smart attendance
							</h1>
							<p className="max-w-xl text-[13px] text-dashboard-text-secondary leading-5">
								Tap students to cycle status, scan admission codes, or mark all present in under two
								minutes.
							</p>
						</div>
					</div>
					<Badge variant="outline" className="gap-1.5 px-2.5 py-1">
						<HugeiconsIcon icon={SparklesIcon} size={14} strokeWidth={2} />
						Smart defaults on
					</Badge>
				</div>
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

			<div className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4 sm:p-5">
				<div className="mb-4 flex flex-wrap items-center gap-2">
					<HugeiconsIcon icon={Calendar03Icon} size={16} className="text-dashboard-text-muted" />
					<p className="font-medium text-[14px] text-dashboard-text-primary">
						Today&apos;s session
					</p>
					{selectedSection ? (
						<Badge variant="outline">
							{formatSectionLabel(
								selectedSection,
								classNameById.get(selectedSection.classId),
								campusNameById.get(selectedSection.campusId),
							)}
						</Badge>
					) : null}
				</div>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void loadSessionForSelection();
					}}
					className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]"
				>
					<FieldGroup className="contents">
						<Field>
							<FieldLabel htmlFor="attendance-section">Section</FieldLabel>
							<SelectField
								id="attendance-section"
								value={sectionId}
								onValueChange={setSectionId}
								nullable
								placeholder={isTeacherScoped ? "Select your homeroom section" : "Select section"}
								items={sectionSelectItems}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="attendance-date">Date</FieldLabel>
							<DatePicker id="attendance-date" value={sessionDate} onValueChange={setSessionDate} />
						</Field>
					</FieldGroup>
					<div className="flex items-end">
						<Button type="submit" disabled={loadSession.isPending || !sectionId}>
							{loadSession.isPending ? <Spinner className="size-4" /> : "Reload session"}
						</Button>
					</div>
				</form>

				<Alert className="mt-4 border-dashboard-border-subtle bg-dashboard-surface-elevated">
					<AlertDescription className="text-[12px] leading-5">
						<strong className="font-medium">Grace window:</strong> {graceMinutes} minutes after bell
						— unmarked students can trigger auto follow-up to guardians (WhatsApp/SMS when
						notifications are enabled). Use <em>Unmarked → absent</em> at end of grace to prep
						follow-up queue.
					</AlertDescription>
				</Alert>
			</div>

			{sessionId ? (
				<div className="space-y-4">
					<div className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4 sm:p-5">
						<AttendanceSummaryStrip
							summary={liveSummary}
							activeFilter={statusFilter}
							onFilterChange={setStatusFilter}
						/>
					</div>

					<div className="rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4 sm:p-5">
						<AttendanceSmartToolbar
							search={search}
							onSearchChange={setSearch}
							scanMode={scanMode}
							onScanModeChange={setScanMode}
							scanValue={scanValue}
							onScanValueChange={setScanValue}
							onScanSubmit={handleScanSubmit}
							onMarkAllPresent={handleMarkAllPresent}
							onMarkUnmarkedAbsent={handleMarkUnmarkedAbsent}
							canMark={canMark}
							lastScanMessage={lastScanMessage}
						/>

						<div className="mt-4">
							{enrollmentsQuery.isLoading || studentsQuery.isLoading ? (
								<div className="flex justify-center py-12">
									<Spinner className="size-6" />
								</div>
							) : rosterStudents.length === 0 ? (
								<p className="py-8 text-center text-[13px] text-dashboard-text-muted">
									No active enrollments in this section.
								</p>
							) : (
								<>
									<p className="mb-3 text-[12px] text-dashboard-text-muted">
										Tap a student to cycle: Present → Late → Absent → Excused → Left early →
										Unmarked
									</p>
									<AttendanceRosterGrid
										roster={filteredRoster}
										markDraft={markDraft}
										highlightStudentId={highlightStudentId}
										canMark={canMark}
										onStatusChange={(studentId, status) =>
											setMarkDraft((current) => ({ ...current, [studentId]: status }))
										}
									/>
								</>
							)}
						</div>
					</div>

					{canMark && rosterStudents.length > 0 ? (
						<div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-dashboard-border bg-dashboard-surface/95 px-4 py-3 shadow-lg backdrop-blur-sm">
							<p className="text-[12px] text-dashboard-text-secondary">
								<span className="font-medium tabular-nums text-dashboard-text-primary">
									{unsavedCount}
								</span>{" "}
								unsaved ·{" "}
								<span className="font-medium tabular-nums text-dashboard-text-primary">
									{rosterIds.length}
								</span>{" "}
								enrolled ·{" "}
								<span className="font-medium text-emerald-600 dark:text-emerald-400">
									{liveSummary.present + liveSummary.late}
								</span>{" "}
								accounted
							</p>
							<Button
								type="button"
								onClick={() => void handleSaveMarks()}
								disabled={markAttendance.isPending}
							>
								{markAttendance.isPending ? (
									<Spinner className="size-4" />
								) : (
									"Save & notify guardians"
								)}
							</Button>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
