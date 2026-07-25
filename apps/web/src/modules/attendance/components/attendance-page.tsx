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
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useClassesQuery, useSectionsQuery } from "@/modules/academic";
import { formatSectionLabel } from "@/modules/academic/utils/format-section-label";
import {
	useConfirmAllPresentMutation,
	useGetOrCreateSessionMutation,
	useMarkAttendanceMutation,
} from "@/modules/attendance/hooks/use-attendance-queries";
import type { AttendanceMarkStatus } from "@/modules/attendance/types/attendance.types";
import {
	useMySectionStudentsQuery,
	useMyTeacherProfileQuery,
} from "@/modules/staff/hooks/use-staff-queries";
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

/** Lightweight skeleton that matches the roster card layout to prevent layout shift. */
function RosterSkeleton() {
	return (
		<div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3" aria-hidden>
			{["a", "b", "c", "d", "e", "f"].map((id) => (
				<div
					key={id}
					className="flex animate-pulse items-center gap-3 rounded-[14px] border border-dashboard-border bg-dashboard-surface px-3 py-3"
				>
					<span className="size-10 shrink-0 rounded-xl bg-dashboard-surface-strong" />
					<span className="min-w-0 flex-1 space-y-1.5">
						<span className="block h-3 w-3/4 rounded bg-dashboard-surface-strong" />
						<span className="block h-2.5 w-1/2 rounded bg-dashboard-surface-strong" />
					</span>
					<span className="h-5 w-12 shrink-0 rounded-full bg-dashboard-surface-strong" />
				</div>
			))}
		</div>
	);
}

export function AttendancePage() {
	const searchParams = useSearchParams();
	const initialSectionId = searchParams.get("sectionId") ?? "";
	const initialSessionDate = searchParams.get("sessionDate") ?? "";
	const wantConfirmAll = searchParams.get("confirmAll") === "1";
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
	const studentsQuery = useStudentsQuery(tenantId, campusId, canRead && !isTeacherScoped);
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
			return (
				myProfileQuery.data?.homeroomSections ??
				myProfileQuery.data?.accessibleSections.filter(
					(section) => section.accessType === "homeroom",
				) ??
				[]
			);
		}
		return (sectionsQuery.data ?? []).filter(
			(section) => !campusId || section.campusId === campusId,
		);
	}, [
		campusId,
		isTeacherScoped,
		myProfileQuery.data?.accessibleSections,
		myProfileQuery.data?.homeroomSections,
		sectionsQuery.data,
	]);

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

	const [sectionId, setSectionId] = useState(initialSectionId);
	const [sessionDate, setSessionDate] = useState(
		() => initialSessionDate || new Date().toLocaleDateString("en-CA"),
	);
	const [sessionId, setSessionId] = useState<string | null>(null);
	// One-way latch: once a session has loaded, the attendance content subtree stays
	// mounted forever. This prevents the whole summary/toolbar/roster/sticky-bar subtree
	// from unmounting (and visually "jumping") when the section or date changes and the
	// sessionId transitions — only the data inside swaps, never the component tree.
	const [sessionLoaded, setSessionLoaded] = useState(false);
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
	const confirmAllRan = useRef(false);

	const canMarkThisSection =
		canMark && (!isTeacherScoped || selectableSections.some((section) => section.id === sectionId));

	const enrollmentsQuery = useSectionEnrollmentsQuery(
		tenantId,
		sectionId || null,
		Boolean(sectionId) && !isTeacherScoped,
	);
	const sectionStudentsQuery = useMySectionStudentsQuery(
		tenantId,
		sectionId || null,
		Boolean(sectionId) && isTeacherScoped,
	);
	const loadSession = useGetOrCreateSessionMutation(tenantId ?? "");
	const markAttendance = useMarkAttendanceMutation(tenantId ?? "", sessionId ?? "");
	const confirmAllPresent = useConfirmAllPresentMutation(tenantId ?? "");

	/** True while a filter change is loading a new session — used for subtle UI feedback. */
	const isSwitchingSection =
		loadSession.isPending ||
		(isTeacherScoped ? sectionStudentsQuery.isFetching : enrollmentsQuery.isFetching);

	/**
	 * True while the session for the *current* section/date is being fetched. Unlike
	 * `isSwitchingSection` (which also covers the initial load), this is only set once a
	 * session has already been shown, so the content subtree stays mounted and only the
	 * data inside it swaps during a section/date change.
	 */
	const isSwitchingSession = sessionLoaded && isSwitchingSection;

	const applySessionView = useCallback(
		(result: Awaited<ReturnType<typeof loadSession.mutateAsync>>) => {
			setSessionId(result.session.id);
			setSessionLoaded(true);
			const existing: Record<string, AttendanceMarkStatus> = {};
			for (const mark of result.marks) {
				existing[mark.studentId] = mark.status;
			}
			setSavedMarks(existing);
			setMarkDraft(existing);
		},
		[],
	);

	const graceMinutes = orgConfigQuery.data?.settings.attendanceGraceMinutes ?? 15;
	const selectedSection = selectableSections.find((section) => section.id === sectionId);

	useEffect(() => {
		if (sectionId || sectionSelectItems.length !== 1) return;
		setSectionId(sectionSelectItems[0]?.value ?? "");
	}, [sectionId, sectionSelectItems]);

	useEffect(() => {
		if (!initialSectionId || sectionId) return;
		if (sectionSelectItems.some((item) => item.value === initialSectionId)) {
			setSectionId(initialSectionId);
		}
	}, [initialSectionId, sectionId, sectionSelectItems]);

	const rosterStudents = useMemo(() => {
		if (isTeacherScoped) {
			return (sectionStudentsQuery.data ?? [])
				.map((row) => row.student)
				.sort((a, b) => a.fullName.localeCompare(b.fullName));
		}

		const students = studentsQuery.data ?? [];
		const studentMap = new Map(students.map((student) => [student.id, student]));
		return (enrollmentsQuery.data ?? [])
			.filter((enrollment) => enrollment.status === "active")
			.map((enrollment) => studentMap.get(enrollment.studentId))
			.filter((student): student is NonNullable<typeof student> => Boolean(student))
			.sort((a, b) => a.fullName.localeCompare(b.fullName));
	}, [enrollmentsQuery.data, isTeacherScoped, sectionStudentsQuery.data, studentsQuery.data]);

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
			applySessionView(result);
			setStatusFilter("all");
			setMessage(`Session ready · ${result.session.sessionDate}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not load attendance session");
		}
	}, [applySessionView, loadSession, sectionId, sessionDate]);

	useEffect(() => {
		if (!sectionId || !sessionDate || !tenantId) return;
		const key = `${sectionId}:${sessionDate}`;
		if (autoLoadedKey.current === key) return;
		autoLoadedKey.current = key;
		// Don't clear sessionId/savedMarks/markDraft here — keepPreviousData on the
		// roster queries and the mutation's onSuccess (applySessionView) handle the
		// transition so the UI never collapses mid-switch.
		void loadSessionForSelection();
	}, [sectionId, sessionDate, tenantId, loadSessionForSelection]);

	useEffect(() => {
		if (!sessionId || rosterIds.length === 0) return;
		setMarkDraft(buildSmartDefaultDraft(rosterIds, savedMarks));
	}, [sessionId, rosterIds, savedMarks]);

	const handleConfirmAllPresentSave = useCallback(async () => {
		if (!sessionId) {
			setError("Load a session first");
			return;
		}
		if (!canMarkThisSection) {
			setError("You do not have permission to mark attendance for this section");
			return;
		}
		if (rosterIds.length === 0) {
			setError("No enrolled students found for this section");
			return;
		}
		setError(null);
		setMessage(null);
		try {
			const result = await confirmAllPresent.mutateAsync({ sessionId });
			applySessionView(result);
			setMessage("All students marked present and saved · parent alerts queue when enabled");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not confirm attendance");
		}
	}, [applySessionView, canMarkThisSection, confirmAllPresent, rosterIds.length, sessionId]);

	useEffect(() => {
		if (!wantConfirmAll || !sessionId || !canMarkThisSection || rosterIds.length === 0) return;
		if (confirmAllRan.current) return;
		confirmAllRan.current = true;
		void handleConfirmAllPresentSave();
	}, [
		wantConfirmAll,
		sessionId,
		canMarkThisSection,
		rosterIds.length,
		handleConfirmAllPresentSave,
	]);

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
		if (!canMarkThisSection) {
			setError("You do not have permission to mark attendance for this section");
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

			{sessionLoaded ? (
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
							onConfirmAllPresentSave={() => void handleConfirmAllPresentSave()}
							confirmAllPending={confirmAllPresent.isPending}
							canMark={canMarkThisSection}
							lastScanMessage={lastScanMessage}
						/>

						<div className="relative mt-4">
							{isSwitchingSession ? (
								<div
									className="absolute inset-0 z-10 flex items-center justify-center rounded-[10px] bg-dashboard-surface/60 backdrop-blur-[1px]"
									aria-hidden
								>
									<Spinner className="size-5 text-dashboard-text-muted" />
								</div>
							) : null}
							<div
								className={cn(
									"min-h-[220px] transition-opacity duration-200",
									isSwitchingSession && "opacity-50",
								)}
								aria-busy={isSwitchingSession}
							>
								{rosterStudents.length === 0 ? (
									isSwitchingSession ? (
										<RosterSkeleton />
									) : (
										<p className="py-8 text-center text-[13px] text-dashboard-text-muted">
											No active enrollments in this section.
										</p>
									)
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
											canMark={canMarkThisSection}
											onStatusChange={(studentId, status) =>
												setMarkDraft((current) => ({ ...current, [studentId]: status }))
											}
										/>
									</>
								)}
							</div>
						</div>
					</div>

					{canMarkThisSection && rosterStudents.length > 0 ? (
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
								variant="outline"
								onClick={() => void handleSaveMarks()}
								disabled={markAttendance.isPending}
							>
								{markAttendance.isPending ? <Spinner className="size-4" /> : "Save changes"}
							</Button>
							<Button
								type="button"
								onClick={() => void handleConfirmAllPresentSave()}
								disabled={confirmAllPresent.isPending}
							>
								{confirmAllPresent.isPending ? (
									<Spinner className="size-4" />
								) : (
									"Confirm all present"
								)}
							</Button>
						</div>
					) : null}
				</div>
			) : null}
		</div>
	);
}
